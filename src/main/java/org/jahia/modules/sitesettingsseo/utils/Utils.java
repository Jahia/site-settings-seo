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
package org.jahia.modules.sitesettingsseo.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * General utility class
 */
public class Utils {

    private static final Logger logger = LoggerFactory.getLogger(Utils.class);

    /**
     *
     * General utility method to get the server-name based on url
     * In the-case it cannot be parsed to URL or it does not have protocol will return null
     *
     * @param urlString         [String] url string
     * @param defaultServerName [String] default server name
     * @return  servername in format of protocal://hostname:port
     * @throws URISyntaxException
     */
    public static String getServerName(String urlString, String defaultServerName) throws URISyntaxException {
        String urlParseString = (urlString == null || urlString.isEmpty()) ? defaultServerName : urlString;
        URI url = new URI(urlParseString);
        String protocol = url.getScheme();
        String host = url.getHost();
        int port = url.getPort();
        if (protocol == null && host.startsWith("www.")) { // for edge cases where starts with www. remove first 4 characters
            return String.format("%s:%d", host.substring(4), port);
        } else {
            if (port == -1) {
                return String.format("%s://%s", protocol, host);
            } else {
                return String.format("%s://%s:%d", protocol, host, port);
            }
        }
    }
}

