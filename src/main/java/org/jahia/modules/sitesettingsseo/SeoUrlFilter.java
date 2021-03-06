package org.jahia.modules.sitesettingsseo;

import net.htmlparser.jericho.*;
import org.jahia.modules.sitesettingsseo.utils.Utils;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.URLGenerator;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.jahia.settings.SettingsBean;
import org.jahia.utils.LanguageCodeConverters;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URISyntaxException;
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
        initUrlGenerator(renderContext, resource);

        JCRNodeWrapper node = resource.getNode();
        StringBuilder links = new StringBuilder();
        links.append(getPageLink(node, renderContext));
        links.append(getAlternativeLinks(node, renderContext));

        Source source = new Source(previousOut);
        OutputDocument od = new OutputDocument(source);
        addContentToHead(source, od, links.toString());
        return od.toString();
    }

    private void initUrlGenerator(RenderContext renderContext, Resource resource) {
        new URLGenerator(renderContext, resource); // this gets set in renderContext
    }

    private String getPageLink(JCRNodeWrapper node, RenderContext renderContext) throws RepositoryException, URISyntaxException {
        String defaultLanguage = node.getResolveSite().getDefaultLanguage();
        boolean isDefaultLanguage = defaultLanguage.equals(node.getLanguage());
        String href = buildHref(node.getUrl(), renderContext, "");
        if (!isDefaultLanguage) {
            String nodeUrl = renderContext.getURLGenerator().buildURL(node, node.getLanguage(), null, "html");
            href = buildHref(nodeUrl, renderContext);
        }
        String canonicalLink = canonicalLink(href);

        if (node.isNodeType(VANITY_URL_MAPPED) && isUrlRewriteSeoRulesEnabled()) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, VANITY_URLS);
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), VANITY_URL);
            for (JCRNodeWrapper url : urls) {
                if (url.getProperty(J_ACTIVE).getBoolean()
                        && node.getLanguage().equals(url.getPropertyAsString(LANGUAGE))
                        && url.getProperty("j:default").getBoolean()) {
                    canonicalLink = canonicalLink(buildHref(url.getPropertyAsString(URL), renderContext));
                }
            }
        }

        return canonicalLink;
    }

    private String getAlternativeLinks(JCRNodeWrapper node, RenderContext renderContext) throws RepositoryException, URISyntaxException {
        StringBuilder altLinks = new StringBuilder();
        Set<String> vanityLangs = new HashSet<>();

        // Get vanity urls for active languages, keep memo of languages used
        if (node.isNodeType(VANITY_URL_MAPPED) && isUrlRewriteSeoRulesEnabled()) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, VANITY_URLS);
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), VANITY_URL);

            for (JCRNodeWrapper url : urls) {
                String vanityLanguage = url.getPropertyAsString(LANGUAGE);
                if (url.getProperty(J_ACTIVE).getBoolean() && !node.getLanguage().equals(vanityLanguage) && url.getProperty(J_DEFAULT).getBoolean()) {
                    vanityLangs.add(vanityLanguage);
                    altLinks.append(altLink(getDashFormatLanguage(vanityLanguage), buildHref(url.getPropertyAsString(URL), renderContext)));
                }
            }
        }

        // Get urls for every language not covered by vanity urls
        Set<String> langs = getActiveLanguagesForMode(renderContext, node);
        for (String lang : langs) {
            if (!node.getLanguage().equals(lang) && !vanityLangs.contains(lang)) {
                String url = renderContext.getURLGenerator().buildURL(node, lang, null, "html");
                String href = buildHref(url, renderContext);
                String altLink = altLink(getDashFormatLanguage(lang), href);
                altLinks.append(altLink);
            }
        }

        return altLinks.toString();
    }

    private String getDashFormatLanguage(String language) {
        Locale locale = LanguageCodeConverters.languageCodeToLocale(language);
        if (locale == null) return language; // Return default language if cannot convert to locale
        return locale.toLanguageTag();
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

    private String buildHref(String url, RenderContext renderContext)
            throws URISyntaxException {
        return buildHref(url, renderContext, null);
    }

    private String buildHref(String url, RenderContext renderContext, String contextPathOverride)
            throws URISyntaxException {
        String defaultServerName = renderContext.getURLGenerator().getServer();
        String serverName = Utils.getServerName(renderContext.getSite().getPropertyAsString("sitemapIndexURL"), defaultServerName);
        url = rewriteUrl(url, contextPathOverride, renderContext.getRequest(), renderContext.getResponse());
        return serverName + url;
    }

    private String altLink(String lang, String href) {
        return String.format("<link rel=\"alternate\" hreflang=\"%s\" href=\"%s\" />", lang, href);
    }

    private String canonicalLink(String href) {
        return String.format("<link rel=\"canonical\" href=\"%s\" />%n", href);
    }

    private static boolean isUrlRewriteSeoRulesEnabled() {
        return SettingsBean.getInstance().isUrlRewriteSeoRulesEnabled();
    }

    /**
     * Copied (relevant) implementation of c:url taglib from taglibs:standard:1.1.2 source
     * prerequisite: url is not an absolute URL
     */
    private static String rewriteUrl(String url, String contextPathOverride, HttpServletRequest request, HttpServletResponse response) {
        // normalize relative URLs against a context root
        contextPathOverride = (contextPathOverride == null) ? request.getContextPath() : contextPathOverride;
        String rewriteUrl = (url.startsWith("/")) ? (contextPathOverride + url) : url;

        return isUrlRewriteSeoRulesEnabled() ? response.encodeURL(rewriteUrl) : rewriteUrl;
    }

}
