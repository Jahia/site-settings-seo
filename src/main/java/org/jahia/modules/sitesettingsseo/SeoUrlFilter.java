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
        String canonicalLink = String.format("<link rel=\"canonical\" href=\"%s\" />%n", node.getUrl());

        // Vanity url if default available
        if (node.isNodeType("jmix:vanityUrlMapped")) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, "jnt:vanityUrls");
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), "jnt:vanityUrl");

            for (JCRNodeWrapper url : urls) {
                if (url.getProperty("j:active").getBoolean() && node.getLanguage().equals(url.getPropertyAsString("jcr:language")) && url.getProperty("j:default").getBoolean()) {
                    canonicalLink = String.format("<link rel=\"canonical\" href=\"%s\" />%n", url.getPropertyAsString("j:url"));
                }
            }
        }

        return canonicalLink;
    }

    private String getAlternativeLinks(JCRNodeWrapper node, Set<String> langs) throws RepositoryException {
        StringBuilder altLinks = new StringBuilder();
        Set<String> vanityLangs = new HashSet<>();

        if (node.isNodeType("jmix:vanityUrlMapped")) {
            List<JCRNodeWrapper> vanity = JCRContentUtils.getChildrenOfType(node, "jnt:vanityUrls");
            List<JCRNodeWrapper> urls = JCRContentUtils.getChildrenOfType(vanity.get(0), "jnt:vanityUrl");

            for (JCRNodeWrapper url : urls) {
                String vanityLanguage = url.getPropertyAsString("jcr:language");
                if (url.getProperty("j:active").getBoolean() && !node.getLanguage().equals(vanityLanguage)) {
                    vanityLangs.add(vanityLanguage);
                    altLinks.append(String.format("<link rel=\"alternate\" hreflang=\"%s\" href=\"%s\" />", vanityLanguage, url.getPropertyAsString("j:url")));
                }
            }
        }

        langs.forEach(lang -> {
            if (!node.getLanguage().equals(lang) && !vanityLangs.contains(lang)) {
                altLinks.append(String.format("<link rel=\"alternate\" hreflang=\"%s\" href=\"%s\" />", lang, node.getUrl().replace(String.format("/%s/", node.getLanguage()), String.format("/%s/", lang))));
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
}
