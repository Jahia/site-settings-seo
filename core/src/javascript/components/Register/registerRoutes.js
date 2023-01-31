import {registry} from '@jahia/ui-extender';
import React from 'react';
import {SiteSettingsSeoEntry} from '../SiteSettingsSeoEntry';

export const registerRoutes = () => {
    const COMP_NAME = 'siteSettingsSeo';

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
};
