package org.jahia.modules.sitesettingsseo;

import net.htmlparser.jericho.*;
import org.jahia.services.content.JCRContentUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
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
    private static final String LANGUAGE = "jcr:language";
    private static final String URL = "j:url";

    @Activate
    public void activate() {
        setPriority(16.2f);
        setApplyOnNodeTypes("jnt:page");
        setApplyOnModes("live,preview");
        setDescription("Generates canonical and alternative urls");
        logger.info("Activated SeoUrlFilter");
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        Source source = new Source(previousOut);
        OutputDocument od = new OutputDocument(source);
        JCRNodeWrapper node = resource.getNode();
        String links = getPageLink(node);
        links += getAlternativeLinks(node, getActiveLanguagesForMode(renderContext, node));

        // Language urls
        logger.info(node.getPath());
        logger.info(node.getUrl());
        logger.info(renderContext.getRequest().getServletPath());
        logger.info(renderContext.getRequest().getHeader("host"));
        logger.info(renderContext.getRequest().getContextPath());

        addContentToHead(source, od, links);

        return od.toString();
    }

    private String getPageLink(JCRNodeWrapper node) throws RepositoryException {
        String canonicalLink = canonicalLink(node.getUrl());

        // Vanity url if default available
        if (node.isNodeType(VANITY_URL_MAPPED)) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, VANITY_URLS);
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), VANITY_URL);

            for (JCRNodeWrapper url : urls) {
                if (url.getProperty(J_ACTIVE).getBoolean() && node.getLanguage().equals(url.getPropertyAsString(LANGUAGE)) && url.getProperty("j:default").getBoolean()) {
                    canonicalLink = canonicalLink(url.getPropertyAsString(URL));
                }
            }
        }

        return canonicalLink;
    }

    private String getAlternativeLinks(JCRNodeWrapper node, Set<String> langs) throws RepositoryException {
        StringBuilder altLinks = new StringBuilder();
        Set<String> vanityLangs = new HashSet<>();

        if (node.isNodeType(VANITY_URL_MAPPED)) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, VANITY_URLS);
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), VANITY_URL);

            for (JCRNodeWrapper url : urls) {
                String vanityLanguage = url.getPropertyAsString(LANGUAGE);
                if (url.getProperty(J_ACTIVE).getBoolean() && !node.getLanguage().equals(vanityLanguage)) {
                    vanityLangs.add(vanityLanguage);
                    altLinks.append(altLink(vanityLanguage, url.getPropertyAsString(URL)));
                }
            }
        }

        langs.forEach(lang -> {
            if (!node.getLanguage().equals(lang) && !vanityLangs.contains(lang)) {
                altLinks.append(altLink(lang, node.getUrl().replace(String.format("/%s/", node.getLanguage()), String.format("/%s/", lang))));
            }
        });

        return altLinks.toString();
    }

    private Set<String> getActiveLanguagesForMode(RenderContext renderContext, JCRNodeWrapper node) throws RepositoryException {
        JCRSiteNode site = node.getResolveSite();
        Set<String> langs = new HashSet<>();

        if (renderContext.isLiveMode()) {
            langs = site.getActiveLiveLanguages();
        } else if (renderContext.isPreviewMode()) {
            List<Locale> inactive = site.getInactiveLanguagesAsLocales();
            langs = site.getLanguagesAsLocales().stream().filter(locale -> !inactive.contains(locale)).map(Locale::getLanguage).collect(Collectors.toSet());
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

    private String altLink(String lang, String href) {
        return String.format("<link rel=\"alternate\" hreflang=\"%s\" href=\"%s\" />", lang, href);
    }

    private String canonicalLink(String href) {
        return String.format("<link rel=\"canonical\" href=\"%s\" />%n", href);
    }
}
