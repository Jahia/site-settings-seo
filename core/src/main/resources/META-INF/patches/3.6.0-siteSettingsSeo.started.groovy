import org.jahia.api.Constants;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.jahia.services.usermanager.JahiaUserManagerService;

import javax.jcr.ItemNotFoundException;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import java.util.LinkedList;
import java.util.List;

private void restoreDeletedVanitys() throws RepositoryException {
    copyMissingVanitysFromLiveToDefault(findAllVanitysInLive());
}

private void copyMissingVanitysFromLiveToDefault(List<JCRNodeWrapper> vanitys) throws RepositoryException {
    JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
            Constants.EDIT_WORKSPACE, null, session -> {
        vanitys.forEach(vanity -> {
            try {
                session.getNodeByIdentifier(vanity.getIdentifier());
            } catch (RepositoryException e) {
                try {
                    if (e instanceof ItemNotFoundException) {
                        session.getWorkspace().clone(Constants.LIVE_WORKSPACE, vanity.getPath(), vanity.getPath(), true);
                        session.getNodeByIdentifier(vanity.getIdentifier()).markForDeletion("");
                    }
                } catch (RepositoryException ex) {
                    log.error("Failed to copy the vanity to the default workspace: ", ex);
                }
            }
        });
        session.save();
        return null;
    });
}

private static List<JCRNodeWrapper> findAllVanitysInLive() throws RepositoryException {
    return JCRTemplate.getInstance()
            .doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
                    Constants.LIVE_WORKSPACE, null, this::findAllVanitys);
}

private static List<JCRNodeWrapper> findAllVanitys(JCRSessionWrapper session) throws RepositoryException {
    String textQuery = "SELECT * FROM [jnt:vanityUrl] AS vanityURL";
    Query vanityUrlsQuery = session.getWorkspace().getQueryManager().createQuery(textQuery, Query.JCR_SQL2);
    NodeIterator vanityUrls = vanityUrlsQuery.execute().getNodes();

    List<JCRNodeWrapper> existingVanityUrls = new LinkedList<>();

    while (vanityUrls.hasNext()) {
        JCRNodeWrapper vanityUrlNode = (JCRNodeWrapper) vanityUrls.nextNode();
        existingVanityUrls.add(vanityUrlNode);
    }
    return existingVanityUrls;
}

restoreDeletedVanitys();
