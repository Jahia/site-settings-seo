package org.jahia.modules.sitesettingsseo.service;

import org.jahia.services.content.JCRNodeWrapper;

public interface VanityUrlService {

    /**
     * Unpublish a vanity URL in a specific language.
     *
     * @param node     The node containing the vanity URL
     * @param language The language of the vanity URL to unpublish
     */
    void unpublishVanityUrlInLanguage(JCRNodeWrapper node, String language);
}
