import org.jahia.api.Constants
import org.jahia.services.content.JCRContentUtils;
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
    copyMissingVanitysFromLiveToDefault(findAllVanitysInWorkspace(Constants.LIVE_WORKSPACE));
}

private void restoreWrongSystemName() throws RepositoryException {
    recalculateVanitySystemName(findAllVanitysInWorkspace(Constants.EDIT_WORKSPACE));
    recalculateVanitySystemName(findAllVanitysInWorkspace(Constants.LIVE_WORKSPACE));
}

private void recalculateVanitySystemName(List<JCRNodeWrapper> vanitys)  throws RepositoryException  {
    JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
            Constants.EDIT_WORKSPACE, null, session -> {
        vanitys.forEach(vanity -> {
            try {
                JCRNodeWrapper currentVanity = session.getNodeByUUID(vanity.getIdentifier())
                String newSystemName = JCRContentUtils.escapeLocalNodeName(currentVanity.getProperty("j:url").getString());
                if (!currentVanity.getName().equals(newSystemName)) {
                    log.info("recalculate system name launched for vanity url: " + currentVanity.getProperty("j:url").getString());
                    log.info("new system name: " + newSystemName + " - (previous one was: " + currentVanity.getName() + ")");
                    session.move(currentVanity.getPath(), currentVanity.getParent().getPath() + "/" + newSystemName);
                }
            } catch (RepositoryException e) {
                log.error("Failed to recalculate the vanity url system name in workspace: ", e);
            }
        });
        session.save();
        return null;
    });
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

private static List<JCRNodeWrapper> findAllVanitysInWorkspace(workspace) throws RepositoryException {
    return JCRTemplate.getInstance()
            .doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
                    workspace, null, this::findAllVanitys);
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
restoreWrongSystemName();
