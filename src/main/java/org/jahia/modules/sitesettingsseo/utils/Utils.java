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
package org.jahia.modules.sitesettingsseo.utils;

import org.jahia.modules.sitesettingsseo.service.VanityUrlService;
import org.jahia.osgi.BundleUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * General utility class
 */
public class Utils {

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

    public static void unpublishVanityUrlInLanguage(JCRNodeWrapper node, String language) {
        BundleUtils.getOsgiService(VanityUrlService.class, null).unpublishVanityUrlInLanguage(node, language);
    }
}

