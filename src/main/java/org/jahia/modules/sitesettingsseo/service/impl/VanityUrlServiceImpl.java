/*
 * MIT License
 *
 * Copyright (c) 2002 - 2025 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
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
