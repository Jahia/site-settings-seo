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
 *     Copyright (C) 2002-2021 Jahia Solutions Group. All rights reserved.
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
package org.jahia.modules.sitesettingsseo.config;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ServiceScope;

import java.util.*;

/**
 * A service class that retrieves add-canonical-meta-tag configuration value from the module site settings seo karaf cfg file
 *
 * @author carp
 */
@Component(service = { SiteSettingsSEOService.class }, scope= ServiceScope.SINGLETON, immediate = true)
public class SiteSettingsSEOService {

    private String addCanonicalMetaTag;

    @Activate
    public void activate(Map<String, ?> props)  {
        addCanonicalMetaTag = (String) props.get("add-canonical-meta-tag");
    }

    /**
     * Gets property value from add-canonical-meta-tag configuration key.
     * @return add-canonical-meta-tag value.
     */
    public String getAddCanonicalMetaTag() {
        return addCanonicalMetaTag;
    }

}
