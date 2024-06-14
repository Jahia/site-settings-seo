import org.jahia.api.Constants
import org.jahia.services.content.JCRContentUtils
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.query.ScrollableQueryCallback
import org.jahia.services.usermanager.JahiaUserManagerService
import org.jahia.services.query.ScrollableQuery

import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.jcr.ItemNotFoundException
import javax.jcr.NodeIterator
import javax.jcr.RepositoryException
import javax.jcr.query.Query
import javax.jcr.query.QueryResult

final Logger logger = LoggerFactory.getLogger("org.jahia.tools.groovyConsole")

private static Query getVanitysQuery(JCRSessionWrapper session) {
    String textQuery = "SELECT * FROM [jnt:vanityUrl] AS vanityURL order by [j:url] asc"
    Query vanityUrlsQuery = session.getWorkspace().getQueryManager().createQuery(textQuery, Query.JCR_SQL2)
    return vanityUrlsQuery
}

private static boolean needRestoreNodeToDefault(JCRNodeWrapper node, JCRSessionWrapper defaultSession, Logger logger) {
    try {
        defaultSession.getNodeByIdentifier(node.getIdentifier())
    } catch (RepositoryException e) {
        if (e instanceof ItemNotFoundException) {
            return true
        }
    }
    return false
}

private static boolean restoreNodeToDefault(JCRNodeWrapper node, JCRSessionWrapper defaultSession, Logger logger) {
    boolean updated = false
    try {
        defaultSession.getWorkspace().clone(Constants.LIVE_WORKSPACE, node.getPath(), node.getPath(), true)
        defaultSession.getNodeByIdentifier(node.getIdentifier()).markForDeletion("")
        updated = true
        logger.debug("Cloned node {} to default workspace", node.getPath())
    } catch (RepositoryException ex) {
        logger.error("Failed to copy the vanity to the default workspace: ", ex)
    }
    return updated
}

private static int handleVanitysInLive(JCRSessionWrapper session, QueryResult stepResult, Logger logger) throws
        RepositoryException {
    logger.info("Manage next {} vanitys", JCRContentUtils.size(stepResult.getRows()))

    long timer = System.currentTimeMillis()

    int numberUpdated = 0
    JCRTemplate.getInstance()
            .doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
                    Constants.EDIT_WORKSPACE, null, defaultSession -> {
                NodeIterator nodeIterator = stepResult.getNodes()

                // Process live vanitys
                List<JCRNodeWrapper> nodesToRestore = new ArrayList<>();
                while (nodeIterator.hasNext()) {
                    JCRNodeWrapper node = (JCRNodeWrapper) nodeIterator.nextNode()
                    if (recalculateVanitySystemName(node, session, logger)) {
                        numberUpdated += 1
                    }
                    if (needRestoreNodeToDefault(node, defaultSession, logger)) {
                        nodesToRestore.add(node)
                    }
                }
                session.save()
                session.refresh(false)

                // Restore default vanitys
                if (!nodesToRestore.isEmpty()) {
                    nodesToRestore.forEach(node -> {
                        numberUpdated += restoreNodeToDefault(node, defaultSession, logger) ? 1 : 0
                    })
                    defaultSession.save()
                    defaultSession.refresh(false)
                }
            })
    logger.info("Took {}ms to update {} vanitys", System.currentTimeMillis() - timer, numberUpdated)
    return numberUpdated
}

private static boolean recalculateVanitySystemName(JCRNodeWrapper vanity, JCRSessionWrapper session, Logger logger) {
    boolean updated = false
    try {
        JCRNodeWrapper currentVanity = session.getNodeByUUID(vanity.getIdentifier())
        String urlProperty = currentVanity.getProperty("j:url").getString()
        String newSystemName = JCRContentUtils.escapeLocalNodeName(urlProperty)
        if (!currentVanity.getName().equals(newSystemName)) {
            logger.debug("Recalculate system name for vanity url: " + currentVanity.getPath())
            if (session.itemExists(currentVanity.getParent().getPath() + "/" + newSystemName)) {
                logger.warn("A node with the path {} already exists, the modification won't be done", currentVanity.getParent().getPath() + "/" + newSystemName)
            } else {
                session.move(currentVanity.getPath(), currentVanity.getParent().getPath() + "/" + newSystemName)
                updated = true
            }
        }
    } catch (RepositoryException e) {
        logger.error("Failed to recalculate the vanity url system name in workspace: ", e)
    }
    return updated
}

private static int handleVanitysInDefault(JCRSessionWrapper session, QueryResult stepResult, Logger logger)
        throws RepositoryException {
    logger.info("Manage next {} vanitys", JCRContentUtils.size(stepResult.getRows()))

    long timer = System.currentTimeMillis()

    NodeIterator nodeIterator = stepResult.getNodes()
    Integer numberUpdated = 0
    while (nodeIterator.hasNext()) {
        JCRNodeWrapper node = (JCRNodeWrapper) nodeIterator.nextNode()
        numberUpdated += recalculateVanitySystemName(node, session, logger) ? 1 : 0
    }
    session.save()
    session.refresh(false)

    logger.info("Took {}ms to update {} vanitys", System.currentTimeMillis() - timer, numberUpdated)
    return numberUpdated
}

private void migrateVanitys(Integer pageSize, Logger logger, String workspace, Closure handler) {
    logger.info("---------------------------------------")
    logger.info("Manage vanitys in the {} workspace", workspace)
    logger.info("---------------------------------------")

    Integer numberUpdated = JCRTemplate.getInstance()
            .doExecuteWithSystemSessionAsUser(JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser(),
                    workspace, null, session -> {
                try {
                    ScrollableQuery scrollableQuery = new ScrollableQuery(pageSize, getVanitysQuery(session))


                    return scrollableQuery.execute(new ScrollableQueryCallback<Integer>() {

                        Integer result = 0

                        @Override
                        boolean scroll() throws RepositoryException {
                            result += handler(session, stepResult, logger)
                            return true
                        }

                        @Override
                        protected Integer getResult() {
                            return result
                        }
                    })
                } catch (RepositoryException e) {
                    logger.error("Failed to migrate vanitys: ", e)
                }
            })
    logger.info("{} vanitys updated while checking {} workspace", numberUpdated, workspace)
}

Integer pageSize = 1000
migrateVanitys(pageSize, logger, Constants.LIVE_WORKSPACE, this::handleVanitysInLive)
migrateVanitys(pageSize, logger, Constants.EDIT_WORKSPACE, this::handleVanitysInDefault)