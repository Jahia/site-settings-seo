(function() {
    window.jahia.i18n.loadNamespaces('site-settings-seo');

    window.jahia.uiExtender.registry.add('adminRoute', 'site-settings-seo', {
        targets: ['jcontent:60'],
        icon: window.jahia.moonstone.toIconComponent('Follow'),
        label: 'site-settings-seo:label.title',
        isSelectable: true,
        requiredPermission: 'siteAdminUrlmapping',
        requireModuleInstalledOnSite: 'site-settings-seo',
        iframeUrl: window.contextJsParameters.contextPath + '/cms/editframe/default/$lang/sites/$site-key.vanity-url-dashboard.html'
    });
})();
