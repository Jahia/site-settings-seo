import React from 'react';
import {registry} from '@jahia/ui-extender';
import i18next from 'i18next';
import {SiteSettingsSeo} from './components/SiteSettingsSeo';

const COMP_NAME = 'siteSettingsSeo';

export default function () {
    registry.add('callback', COMP_NAME, {
        targets: ['jahiaApp-init:23'],
        callback: async () => {
            await i18next.loadNamespaces(COMP_NAME);

            registry.add('adminRoute', COMP_NAME, {
                targets: ['jcontent:60'],
                icon: window.jahia.moonstone.toIconComponent('Search'),
                label: 'site-settings-seo:label.seo',
                isSelectable: false,
                requiredPermission: 'siteAdminUrlmapping',
                // requireModuleInstalledOnSite: COMP_NAME,
            });

            registry.add('adminRoute', `${COMP_NAME}/VanityUrls`, {
                targets: [`jcontent-${COMP_NAME}:60`],
                icon: window.jahia.moonstone.toIconComponent('Follow'),
                label: 'site-settings-seo:label.title',
                isSelectable: true,
                requiredPermission: 'siteAdminUrlmapping',
                // requireModuleInstalledOnSite: COMP_NAME,
                // iframeUrl: window.contextJsParameters.contextPath + '/cms/editframe/default/$lang/sites/$site-key.vanity-url-dashboard.html'
                render: () => React.createElement(SiteSettingsSeo, {dxContext: window.contextJsParameters, id: window.contextJsParameters['currentNodeId']})
            });

            console.log('%c Site Settings SEO registered routes', 'color: #3c8cba');
        }
    });
}
