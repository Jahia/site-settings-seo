<%@ page language="java" contentType="text/javascript" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>

console.log("vanity");
contextJsParameters['mainResourceId'] = contextJsParameters['siteUuid'];
contextJsParameters['mainResourcePath'] = '/sites/' + contextJsParameters['siteKey'];
contextJsParameters['siteTitle'] = contextJsParameters['site'];
