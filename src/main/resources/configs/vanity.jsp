<%@ page language="java" contentType="text/javascript" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>

console.log("vanity");
contextJsParameters['mainResourceId'] = '${renderContext.mainResource.node.identifier}';
contextJsParameters['mainResourcePath'] = '${renderContext.mainResource.node.path}';
contextJsParameters['siteKey'] = '${renderContext.mainResource.node.resolveSite.name}';
contextJsParameters['siteTitle'] = '${functions:escapeJavaScript(renderContext.site.title)}';
contextJsParameters['currentNodeId'] = '${currentNode.identifier}';
