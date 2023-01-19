/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.sitesettingsseo;

import net.htmlparser.jericho.*;
import org.jahia.modules.sitesettingsseo.config.ConfigService;
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
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.touk.throwing.ThrowingFunction;
import pl.touk.throwing.ThrowingPredicate;

import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.net.URISyntaxException;
import java.util.*;
import java.util.stream.Collectors;

import static org.jahia.services.seo.jcr.VanityUrlManager.*;

/**
 * Injects canonical and alternative urls in head element in preview and live modes.
 */
@Component(service = RenderFilter.class)
public class SeoUrlFilter extends AbstractFilter {

    private static final Logger logger = LoggerFactory.getLogger(SeoUrlFilter.class);
    private static final String LANGUAGE = "jcr:language";
    private static final String INVALID_LANGUAGES = "j:invalidLanguages";

    private ConfigService configService;

    @Reference(service = ConfigService.class)
    public void setConfigService(ConfigService configService) {
        this.configService = configService;
    }

    @Activate
    public void activate() {
        setPriority(16.2f);
        setApplyOnMainResource(true);
        setApplyOnModes("live,preview");
        setDescription("Generates canonical and alternative urls");
        addCondition((renderContext, resource) -> configService.isMetagTagGenerationEnabled());
        logger.debug("Activated SeoUrlFilter");
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        Source source = new Source(previousOut);
        OutputDocument od = new OutputDocument(source);
        List<Element> headList = source.getAllElements(HTMLElementName.HEAD);
        if (!headList.isEmpty()) {
            initUrlGenerator(renderContext, resource);
            JCRNodeWrapper node = resource.getNode();

            // Get all valid languages for current node
            Set<String> langs = getActiveLanguages(renderContext, node);
            // Get all valid vanities for current node
            Map<String, String> vanities = getActiveVanityUrls(node, langs);

            // Generate the links based on all active languages and available precalculated vanities
            String finalOutPutLink = langs.stream()
                    .map(ThrowingFunction.unchecked(lang -> getLinkForLang(node, vanities, lang, renderContext)))
                    .collect(Collectors.joining("\n"));

            StartTag et = headList.get(0).getStartTag();
            od.replace(et.getEnd(), et.getEnd(), finalOutPutLink);
            return od.toString();
        }
        return previousOut;
    }

    private void initUrlGenerator(RenderContext renderContext, Resource resource) {
        if (renderContext.getURLGenerator() == null) {
            new URLGenerator(renderContext, resource); // this gets set in renderContext
        }
    }

    private String getLinkForLang(JCRNodeWrapper node, Map<String, String> vanities, String lang, RenderContext renderContext) throws URISyntaxException {
        String url = vanities.containsKey(lang) ?
                vanities.get(lang) :
                renderContext.getURLGenerator().buildURL(node, lang, null, "html");
        String href = buildHref(url, renderContext);

        // In case it's current lang build a canonical
        String links = String.format("<link rel=\"alternate\" hreflang=\"%s\" href=\"%s\" />", getDashFormatLanguage(lang), href);
        return node.getLanguage().equals(lang) ?
                String.format("<link rel=\"canonical\" href=\"%s\" />", href) + links:
                links;
    }

    private Map<String, String> getActiveVanityUrls(JCRNodeWrapper node, Set<String> activeLangs) throws RepositoryException {
        if (node.isNodeType(JAHIAMIX_VANITYURLMAPPED) && isUrlRewriteSeoRulesEnabled()) {
            JCRNodeWrapper vanityMappings;
            try {
                vanityMappings = node.getNode(VANITYURLMAPPINGS_NODE);
            } catch (RepositoryException e) {
                // no mapping
                return Collections.emptyMap();
            }

            boolean isLive = "live".equals(node.getSession().getWorkspace().getName());
            return JCRContentUtils.getChildrenOfType(vanityMappings, JAHIANT_VANITYURL).stream()
                    .filter(ThrowingPredicate.unchecked(url -> {
                        return url.getProperty(PROPERTY_ACTIVE).getBoolean() && // Check it's active
                                url.getProperty(PROPERTY_DEFAULT).getBoolean() && // Check it's default
                                activeLangs.contains(url.getPropertyAsString(LANGUAGE)) && // Check that the current node have a displayable lang for the vanity
                                (!isLive || !url.hasProperty("j:published") || url.getProperty("j:published").getBoolean()); // Check vanity is published
                    }))
                    .collect(Collectors.toMap(
                            ThrowingFunction.unchecked(url -> url.getPropertyAsString(LANGUAGE)),
                            ThrowingFunction.unchecked(url -> url.getPropertyAsString(PROPERTY_URL))
                    ));
        }
        return Collections.emptyMap();
    }

    private String getDashFormatLanguage(String language) {
        Locale locale = LanguageCodeConverters.languageCodeToLocale(language);
        if (locale == null) return language; // Return default language if cannot convert to locale
        return locale.toLanguageTag();
    }

    private Set<String> getActiveLanguages(RenderContext renderContext, JCRNodeWrapper node) throws RepositoryException {
        final Set<String> inactiveLangs = new HashSet<>();
        final Set<String> langs = new LinkedHashSet<>();
        // Insert current lang in first position: just to generate beautiful HTML with canonical link first :)
        langs.add(node.getLanguage());

        // Process mode languages
        JCRSiteNode site = node.getResolveSite();
        if (renderContext.isLiveMode()) {
            langs.addAll(site.getActiveLiveLanguages());
        } else if (renderContext.isPreviewMode()) {
            langs.addAll(site.getLanguages());
            inactiveLangs.addAll(site.getInactiveLanguages());
        }

        // Check invalid languages on current node.
        if (node.hasProperty(INVALID_LANGUAGES)) {
            Value[] values = node.getProperty(INVALID_LANGUAGES).getValues();
            if (values != null && values.length > 0) {
                inactiveLangs.addAll(Arrays.stream(values).map(ThrowingFunction.unchecked(Value::getString)).collect(Collectors.toSet()));
            }
        }

        // Filter inactive language and check that the current node have a published translation node available
        return langs.stream()
                .filter(ThrowingPredicate.unchecked(lang -> !inactiveLangs.contains(lang)))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String buildHref(String url, RenderContext renderContext) throws URISyntaxException {
        String defaultServerName = renderContext.getURLGenerator().getServer();
        String serverName = Utils.getServerName(renderContext.getSite().getPropertyAsString("sitemapIndexURL"), defaultServerName);

        // Handle context
        url = (url.startsWith("/")) ? (renderContext.getRequest().getContextPath() + url) : url;
        // Handle Seo rewrite rules
        url = isUrlRewriteSeoRulesEnabled() ? renderContext.getResponse().encodeURL(url) : url;
        return serverName + url;
    }

    private static boolean isUrlRewriteSeoRulesEnabled() {
        return SettingsBean.getInstance().isUrlRewriteSeoRulesEnabled();
    }

}
