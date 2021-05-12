import React from 'react';
import {registry} from '@jahia/ui-extender';
import i18next from 'i18next';
import {SiteSettingsSeoEntry} from './components/SiteSettingsSeoEntry';
import SiteSettingsSeoCardEntry from './components/contentEditor/SiteSettingsSeoEntry';

const COMP_NAME = 'siteSettingsSeo';

export default function () {
    registry.add('callback', COMP_NAME, {
        targets: ['jahiaApp-init:23'],
        callback: async () => {
            await i18next.loadNamespaces('site-settings-seo');

            registry.add('adminRoute', COMP_NAME, {
                targets: ['jcontent:60'],
                icon: window.jahia.moonstone.toIconComponent('Search'),
                label: 'site-settings-seo:label.seo',
                isSelectable: false
            });

            registry.add('adminRoute', `${COMP_NAME}/VanityUrls`, {
                targets: [`jcontent-${COMP_NAME}:60`],
                label: 'site-settings-seo:label.title',
                isSelectable: true,
                requiredPermission: 'siteAdminUrlmapping',
                render: () => React.createElement(SiteSettingsSeoEntry, {dxContext: {...window.contextJsParameters}})
            });

            registry.add('contentEditor', 'vanityUrls', {
                render: () => React.createElement(SiteSettingsSeoCardEntry, {dxContext: {...window.contextJsParameters}})
            });

            console.log('%c Site Settings SEO registered routes', 'color: #3c8cba');
        }
    });
}
