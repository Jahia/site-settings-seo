package org.jahia.modules.sitesettingsseo.service.impl;

import org.jahia.modules.sitesettingsseo.service.VanityUrlService;
import org.jahia.services.content.*;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.util.ArrayList;
import java.util.List;

@Component(service = VanityUrlService.class, immediate = true)
public class VanityUrlServiceImpl implements VanityUrlService {

    private static final String VANITY_URL_MAPPING = "vanityUrlMapping";

    private static final Logger LOGGER = LoggerFactory.getLogger(VanityUrlServiceImpl.class);
    public static final String J_PUBLISHED = "j:published";
    private JCRPublicationService publicationService;

    @Reference
    public void setJCRPublicationService(JCRPublicationService publicationService) {
        this.publicationService = publicationService;
    }

    @Override
    public void unpublishVanityUrlInLanguage(JCRNodeWrapper node, String language) {
        try {
            JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, null, null, session -> {
                List<String> uuidsToUnpublish = new ArrayList<>();
                JCRContentUtils.getChildrenOfType(node.getNode(VANITY_URL_MAPPING), "jnt:vanityUrl").forEach(vanityUrl -> {
                    try {
                        boolean isPublished = vanityUrl.hasProperty(J_PUBLISHED) && vanityUrl.getProperty(J_PUBLISHED).getBoolean();
                        if (vanityUrl.getPropertyAsString("jcr:language").equals(language) && isPublished) {
                            uuidsToUnpublish.add(vanityUrl.getIdentifier());
                        }
                    } catch (RepositoryException e) {
                        LOGGER.error("Error while unpublishing vanity URL in language {}", language, e);
                    }
                });
                if (!uuidsToUnpublish.isEmpty()) {
                    publicationService.unpublish(uuidsToUnpublish);
                }
                return null;
            });
        } catch (RepositoryException e) {
            LOGGER.error("Error while modifying vanity URL in language {}", language, e);
        }
    }
}
