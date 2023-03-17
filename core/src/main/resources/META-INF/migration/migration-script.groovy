import org.jahia.api.Constants
import org.jahia.services.content.JCRContentUtils
import org.jahia.services.content.JCRNodeIteratorWrapper;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate
import org.jahia.services.query.QueryResultWrapper
import org.jahia.services.scheduler.JSR223ScriptJob
import org.jahia.services.usermanager.JahiaUserManagerService
import org.slf4j.Logger
import org.slf4j.LoggerFactory;

import javax.jcr.ItemNotFoundException;
import javax.jcr.RepositoryException;
import javax.jcr.query.Query;
import java.util.List;

final Logger logger = LoggerFactory.getLogger("org.jahia.tools.groovyConsole");

private QueryResultWrapper getVanitys(JCRSessionWrapper session, Integer pageSize, Integer offset) {
    String textQuery = "SELECT * FROM [jnt:vanityUrl] AS vanityURL";
    Query vanityUrlsQuery = session.getWorkspace().getQueryManager().createQuery(textQuery, Query.JCR_SQL2);
    if (pageSize != null) {
        vanityUrlsQuery.setLimit(pageSize);
    }
    if (offset != null) {
        vanityUrlsQuery.setOffset(offset);
    }
    return vanityUrlsQuery.execute()
}

private boolean restoreNodeToDefaultIfNecessary(JCRNodeWrapper node, JCRSessionWrapper defaultSession, Logger logger) {
    boolean updated = false
    try {
        defaultSession.getNodeByIdentifier(node.getIdentifier())
    } catch (RepositoryException e) {
        try {
            if (e instanceof ItemNotFoundException) {
                defaultSession.getWorkspace().clone(Constants.LIVE_WORKSPACE, node.getPath(), node.getPath(), true)
                defaultSession.getNodeByIdentifier(node.getIdentifier()).markForDeletion("");
                updated = true
                logger.debug("Cloned node {} to default workspace", node.getPath())
            }
        } catch (RepositoryException ex) {
            logger.error("Failed to copy the vanity to the default workspace: ", ex)
        }
    }
    return updated
}

private List<JCRNodeWrapper> handleVanitysInLiveWithPagination(JCRSessionWrapper session, int pageSize, int offset, long totalNumberOfVanity, Logger logger) throws
        RepositoryException {
    if (offset >= totalNumberOfVanity) {
        return
    }
    long timer = System.currentTimeMillis()
    QueryResultWrapper vanityUrls = getVanitys(session, pageSize, offset)

    logger.info("Manage from {} to {} on {} vanitys", offset, offset + JCRContentUtils.size(vanityUrls.getRows()), totalNumberOfVanity)
    Integer numberUpdated = 0
    JCRTemplate.getInstance()
            .doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
                    Constants.EDIT_WORKSPACE, null, defaultSession -> {
                JCRNodeIteratorWrapper vanityNodes = vanityUrls.getNodes();
                boolean doSave = false

                while (vanityNodes.hasNext()) {
                    JCRNodeWrapper node = (JCRNodeWrapper) vanityNodes.nextNode()
                    numberUpdated += recalculateVanitySystemName(node, session, true, logger)
                    boolean restored = restoreNodeToDefaultIfNecessary(node, defaultSession, logger)
                    if (restored) {
                        numberUpdated += 1
                        doSave = true
                    }
                }
                if (doSave) {
                    defaultSession.save()
                }
            })
    logger.info("Took {}ms to update {} vanitys", System.currentTimeMillis() - timer, numberUpdated)

    handleVanitysInLiveWithPagination(session, pageSize, offset + pageSize, totalNumberOfVanity, logger);
}

private void handleLiveWorkspaceVanitys(Integer pageSize, Logger logger) {
    logger.info("------------------------------------")
    logger.info("Manage vanitys in the live workspace")
    logger.info("------------------------------------")

    JCRTemplate.getInstance()
            .doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
                    Constants.LIVE_WORKSPACE, null, session -> {
                try {
                    long totalNumberOfVanity = getVanitys(session, null, null).getRows().getSize()
                    handleVanitysInLiveWithPagination(session, pageSize, 0, totalNumberOfVanity, logger)
                } catch (RepositoryException e) {
                    logger.error("Failed to migrate vanitys: ", e)
                }
            })
}

private void handleDefaultWorkspaceVanitys(Integer pageSize, logger) {
    logger.info("---------------------------------------")
    logger.info("Manage vanitys in the default workspace")
    logger.info("---------------------------------------")

    JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
            Constants.EDIT_WORKSPACE, null, session -> {
        try {
            long totalNumberOfVanity = getVanitys(session, null, null).getRows().getSize()
            handleVanitysInDefaultWithPagination(session, pageSize, 0, totalNumberOfVanity, logger)
        } catch (RepositoryException e) {
            logger.error("Failed to migrate vanitys: ", e)
        }
    })
}

private void handleVanitysInDefaultWithPagination(JCRSessionWrapper session, int pageSize, int offset, long totalNumberOfVanity, Logger logger)
        throws RepositoryException {
    if (offset >= totalNumberOfVanity) {
        return
    }
    long timer = System.currentTimeMillis()
    QueryResultWrapper vanityUrls = getVanitys(session, pageSize, offset)

    logger.info("Manage from {} to {} on {} vanitys", offset, offset + JCRContentUtils.size(vanityUrls.getRows()), totalNumberOfVanity)

    JCRNodeIteratorWrapper vanityNodes = vanityUrls.getNodes();
    Integer numberUpdated = 0
    while (vanityNodes.hasNext()) {
        JCRNodeWrapper node = (JCRNodeWrapper) vanityNodes.nextNode()
        numberUpdated += recalculateVanitySystemName(node, session, false, logger)
    }
    session.save()

    logger.info("Took {}ms to update {} vanitys", System.currentTimeMillis() - timer, numberUpdated)

    handleVanitysInDefaultWithPagination(session, pageSize, offset + pageSize, totalNumberOfVanity, logger);
}

private Integer recalculateVanitySystemName(JCRNodeWrapper vanity, JCRSessionWrapper session, boolean saveImmediately, Logger logger) {
    Integer numberUpdated = 0
    try {
        JCRNodeWrapper currentVanity = session.getNodeByUUID(vanity.getIdentifier())
        String urlProperty = currentVanity.getProperty("j:url").getString()
        String newSystemName = JCRContentUtils.escapeLocalNodeName(urlProperty);
        if (!currentVanity.getName().equals(newSystemName)) {
            logger.debug("Recalculate system name for vanity url: " + currentVanity.getPath())
            if (session.itemExists(currentVanity.getParent().getPath() + "/" + newSystemName)) {
                logger.warn("A node with the path {} already exists, the modification won't be done", currentVanity.getParent().getPath() + "/" + newSystemName)
            } else {
                session.move(currentVanity.getPath(), currentVanity.getParent().getPath() + "/" + newSystemName)
                if (saveImmediately) {
                    session.save()
                }
                numberUpdated = 1
            }
        }
    } catch (RepositoryException e) {
        logger.error("Failed to recalculate the vanity url system name in workspace: ", e);
    }
    return numberUpdated
}

Integer pageSize = 1000
handleLiveWorkspaceVanitys(pageSize, logger)
handleDefaultWorkspaceVanitys(pageSize, logger)