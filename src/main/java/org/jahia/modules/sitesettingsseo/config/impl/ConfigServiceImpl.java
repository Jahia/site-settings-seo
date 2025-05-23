/*
 * MIT License
 *
 * Copyright (c) 2002 - 2025 Jahia Solutions Group. All rights reserved.
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
