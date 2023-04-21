/*
 * ==========================================================================================
 * =                            JAHIA'S ENTERPRISE DISTRIBUTION                             =
 * ==========================================================================================
 *
 *                                  http://www.jahia.com
 *
 * JAHIA'S ENTERPRISE DISTRIBUTIONS LICENSING - IMPORTANT INFORMATION
 * ==========================================================================================
 *
 *     Copyright (C) 2002-2022 Jahia Solutions Group. All rights reserved.
 *
 *     This file is part of a Jahia's Enterprise Distribution.
 *
 *     Jahia's Enterprise Distributions must be used in accordance with the terms
 *     contained in the Jahia Solutions Group Terms &amp; Conditions as well as
 *     the Jahia Sustainable Enterprise License (JSEL).
 *
 *     For questions regarding licensing, support, production usage...
 *     please contact our team at sales@jahia.com or go to http://www.jahia.com/license.
 *
 * ==========================================================================================
 */
package org.jahia.modules.sitesettingsseo.config.impl;

import org.jahia.modules.sitesettingsseo.config.ConfigService;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * A service class that retrieves enableSEOAutomaticMetaTagGeneration configuration value from the module site settings seo karaf cfg file
 *
 * @author carp
 */
@Component(service = ConfigService.class, immediate = true)
public class ConfigServiceImpl implements ConfigService {
    private static final Logger logger = LoggerFactory.getLogger(ConfigServiceImpl.class);

    private Boolean isMetagTagGenerationEnabled;

    @Activate
    public void activate(Map<String, ?> props)  {
        isMetagTagGenerationEnabled = Boolean.parseBoolean((String) props.get("enableSEOAutomaticMetaTagGeneration"));
        logger.info("Site Settings SEO configuration activated with meta tag generation enabled at: {}", isMetagTagGenerationEnabled);
    }

    @Override
    public boolean isMetagTagGenerationEnabled() {
        return isMetagTagGenerationEnabled;
    }

    @Deactivate
    public void deactivate() {
        logger.info("Site Settings SEO configuration deactivated");
    }

}
