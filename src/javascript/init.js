import React from 'react';
import {registry} from '@jahia/ui-extender';
import i18next from 'i18next';
import {SiteSettingsSeoEntry} from './components/SiteSettingsSeoEntry';
import {VanityAction} from './components/contentEditor/actions';

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

            // Content editor action registration
            registry.add('action', 'vanityUrls', {
                component: VanityAction,
                targets: ['content-editor/header/3dots:3'],
                requiredPermission: 'siteAdminUrlmapping',
                showOnNodeTypes: ['jmix:vanityUrlMapped', 'jnt:page', 'jnt:file', 'jmix:mainResource', 'jmix:canHaveVanityUrls'],
                label: 'site-settings-seo:label.manage',
                dataSelRole: 'vanityUrls'
            });

            console.log('%c Site Settings SEO registered routes', 'color: #3c8cba');
        }
    });
}
