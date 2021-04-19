package org.jahia.modules.sitesettingsseo;

import net.htmlparser.jericho.*;
import org.apache.commons.lang.StringUtils;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.jahia.settings.SettingsBean;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Injects canonical and alternative urls in head element in preview and live modes.
 */
@Component(service = RenderFilter.class)
public class SeoUrlFilter extends AbstractFilter {

    private static final Logger logger = LoggerFactory.getLogger(SeoUrlFilter.class);
    private static final String VANITY_URL_MAPPED = "jmix:vanityUrlMapped";
    private static final String VANITY_URLS = "jnt:vanityUrls";
    private static final String VANITY_URL = "jnt:vanityUrl";
    private static final String J_ACTIVE = "j:active";
    private static final String J_DEFAULT = "j:default";
    private static final String LANGUAGE = "jcr:language";
    private static final String URL = "j:url";

    @Activate
    public void activate() {
        setPriority(16.2f);
        setApplyOnNodeTypes("jnt:page");
        setApplyOnModes("live,preview");
        setDescription("Generates canonical and alternative urls");
        logger.debug("Activated SeoUrlFilter");
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        Source source = new Source(previousOut);
        OutputDocument od = new OutputDocument(source);
        JCRNodeWrapper node = resource.getNode();
        StringBuilder links = new StringBuilder();
        links.append(getPageLink(node, renderContext));
        links.append(getAlternativeLinks(node, renderContext, getActiveLanguagesForMode(renderContext, node)));
        addContentToHead(source, od, links.toString());
        return od.toString();
    }

    private String getPageLink(JCRNodeWrapper node, RenderContext renderContext) throws RepositoryException, MalformedURLException {
        // Default url if no vanity
        String canonicalLink = canonicalLink(buildHref(node, renderContext, getPathInfoForMode(node, renderContext)));

        if (!node.isNodeType(VANITY_URL_MAPPED)) {
            return canonicalLink;
        }

        // Vanity url if default available
        List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, VANITY_URLS);
        List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), VANITY_URL);

        for (JCRNodeWrapper url : urls) {
            if (url.getProperty(J_ACTIVE).getBoolean() && node.getLanguage().equals(url.getPropertyAsString(LANGUAGE)) && url.getProperty("j:default").getBoolean()) {
                canonicalLink = canonicalLink(buildHref(node, renderContext, url.getPropertyAsString(URL)));
            }
        }

        return canonicalLink;
    }

    private String getAlternativeLinks(JCRNodeWrapper node, RenderContext renderContext, Set<String> langs) throws RepositoryException, MalformedURLException {
        StringBuilder altLinks = new StringBuilder();
        Set<String> vanityLangs = new HashSet<>();

        // Get vanity urls for active languages, keep memo of languages used
        if (node.isNodeType(VANITY_URL_MAPPED)) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, VANITY_URLS);
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), VANITY_URL);

            for (JCRNodeWrapper url : urls) {
                String vanityLanguage = url.getPropertyAsString(LANGUAGE);
                if (url.getProperty(J_ACTIVE).getBoolean() && !node.getLanguage().equals(vanityLanguage) && url.getProperty(J_DEFAULT).getBoolean()) {
                    vanityLangs.add(vanityLanguage);
                    altLinks.append(altLink(vanityLanguage, buildHref(node, renderContext, url.getPropertyAsString(URL))));
                }
            }
        }

        // Get urls for every language not covered by vanity urls
        for (String lang : langs) {
            if (!node.getLanguage().equals(lang) && !vanityLangs.contains(lang)) {
                String path = getPathInfoForMode(node, renderContext);

                if (renderContext.isPreviewMode()) {
                    path = path.replace(String.format("/%s/", node.getLanguage()), String.format("/%s/", lang));
                } else {
                    path = path.replace(String.format("/%s/", node.getLanguage()), "/");
                    path = String.format("/%s%s", lang, path);
                }

                altLinks.append(altLink(lang,  buildHref(node, renderContext, path)));
            }
        }

        return altLinks.toString();
    }

    private Set<String> getActiveLanguagesForMode(RenderContext renderContext, JCRNodeWrapper node) throws RepositoryException {
        JCRSiteNode site = node.getResolveSite();
        Set<String> langs = new HashSet<>();

        if (renderContext.isLiveMode()) {
            langs = site.getActiveLiveLanguages();
        } else if (renderContext.isPreviewMode()) {
            Set<String> inactive = site.getInactiveLanguages();
            langs = site.getLanguages().stream().filter(lang -> !inactive.contains(lang)).collect(Collectors.toSet());
        }

        return langs;
    }

    private void addContentToHead(Source source, OutputDocument od, String content) {
        List<Element> headList = source.getAllElements(HTMLElementName.HEAD);
        if (!headList.isEmpty()) {
            StartTag et = headList.get(0).getStartTag();
            od.replace(et.getEnd(), et.getEnd(), content);
        }
    }

    private String getPathInfoForMode(JCRNodeWrapper node, RenderContext renderContext) throws RepositoryException {
        String path = "";
        JCRSiteNode site = node.getResolveSite();

        if (renderContext.isLiveMode()) {
            path = node.getPath();

            if (!renderContext.getRequest().getServerName().contains("localhost")) {
                path = StringUtils.substringAfterLast(node.getPath(), String.format("/%s/", site.getSiteKey()));
            }

            if (!path.startsWith("/")) {
                path = String.format("/%s", path);
            }

            if (!site.getDefaultLanguage().equals(node.getLanguage())) {
                path = String.format("/%s%s", node.getLanguage(), path);
            }

            path = String.format("%s.html", path);
        } else {
            path = node.getUrl();
        }

        return path;
    }

    private String buildHref(JCRNodeWrapper node, RenderContext renderContext, String path) throws MalformedURLException, RepositoryException {
        return prependServerName(node, renderContext, path);
    }

    private String altLink(String lang, String href) {
        return String.format("<link rel=\"alternate\" hreflang=\"%s\" href=\"%s\" />", lang, href);
    }

    private String canonicalLink(String href) {
        return String.format("<link rel=\"canonical\" href=\"%s\" />%n", href);
    }

    private String prependServerName(JCRNodeWrapper node, RenderContext renderContext, String nodeURL) throws RepositoryException, MalformedURLException {
        HttpServletRequest request = renderContext.getRequest();
        String requestServerName = request.getServerName();

        String serverName = node.getResolveSite().getServerName();
        if (!StringUtils.isEmpty(serverName) && requestServerName.equals(serverName)) {
            int serverPort = SettingsBean.getInstance().getSiteURLPortOverride();
            if (serverPort == 0) {
                serverPort = request.getServerPort();
            }

            if (serverPort == 80 && "http".equals(request.getScheme()) || serverPort == 443 && "https".equals(request.getScheme())) {
                serverPort = -1;
            }

            nodeURL = (new URL(request.getScheme(), serverName, serverPort, renderContext.getURLGenerator().getContext() + nodeURL)).toString();
        }

        return nodeURL;
    }
}
