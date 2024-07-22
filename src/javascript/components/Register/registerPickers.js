import {registry} from '@jahia/ui-extender';

export const registerPickers = () => {
    const pagesItem = registry.get('accordionItem', 'pages');
    const mediasItem = registry.get('accordionItem', 'picker-media') || {};
    const mediaConfig = mediasItem ? {
        ...mediasItem,
        tableConfig: {
            ...mediasItem.tableConfig,
            typeFilter: ['jnt:file', 'jmix:canHaveVanityUrls']
        }
    } : {};

    registry.add('pickerConfiguration', 'targetOnMoveVanity', {
        searchContentType: 'jmix:searchable',
        selectableTypesTable: ['jnt:page', 'jmix:mainResource', 'jmix:canHaveVanityUrls', 'jnt:file'],
        showOnlyNodesWithTemplates: true,
        pickerDialog: {
            displaySiteSwitcher: false,
            dialogTitle: 'site-settings-seo:label.dialogs.move.title',
            isSiteEnabled: siteKey => siteKey !== 'systemsite',
            displayTree: true
        },
        // List of accordions to be display on the left side of the picker
        accordions: ['picker-pages', 'picker-content-folders', 'picker-media'],

        accordionItem: {
            'picker-pages': pagesItem ? {...pagesItem} : {},
            'picker-content-folders': {
                // Specify the root node for the Content Folder accordion
                rootPath: '/sites/{site}/contents',

                treeConfig: {
                    hideRoot: false,
                    openableTypes: ['jmix:visibleInContentTree', 'jnt:contentFolder', 'jmix:list'],
                    selectableTypes: ['jmix:mainResource', 'jmix:canHaveVanityUrls']
                },
                tableConfig: {
                    // List of types that can be expanded in the main table, when using the Structured view
                    openableTypes: ['jmix:list']
                }
            },
            'picker-media': mediaConfig
        }
    });
};
