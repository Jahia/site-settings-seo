import {registry} from '@jahia/ui-extender';
import {PublishAllAction, VanityAction, UpdateVanityAction, MoveVanityAction, PublishVanityAction} from '../actions';
import {CloudUpload, Delete, Publish, Star, SwapHoriz} from '@jahia/moonstone';
import React from 'react';
import {DeleteVanityAction} from '../actions/DeleteVanityAction';

export const registerActions = () => {
    // Content editor action registration
    registry.add('action', 'vanityUrls', {
        component: VanityAction,
        targets: ['content-editor/header/3dots:3'],
        requiredPermission: 'siteAdminUrlmapping',
        showOnNodeTypes: ['jmix:vanityUrlMapped', 'jnt:page', 'jnt:file', 'jmix:mainResource', 'jmix:canHaveVanityUrls'],
        label: 'site-settings-seo:label.manage',
        dataSelRole: 'vanityUrls'
    });

    registry.add('action', 'vanityListMenu', registry.get('action', 'contentMenu'), {
        targets: ['site-settings-seo/vanity-list/row/actions:0.2'],
        menuTarget: 'site-settings-seo/vanity-list-menu'
    });

    registry.add('action', 'updateVanity', {
        targets: ['site-settings-seo/vanity-list-menu:0.1'],
        dataSelRole: 'updateVanity',
        buttonIcon: <Star/>,
        component: UpdateVanityAction
    });

    registry.add('action', 'moveVanity', {
        targets: ['site-settings-seo/vanity-list-menu:0.2'],
        dataSelRole: 'moveVanity',
        buttonIcon: <SwapHoriz/>,
        buttonLabel: 'site-settings-seo:label.actions.move',
        component: MoveVanityAction
    });

    registry.add('action', 'publishVanity', {
        targets: ['site-settings-seo/vanity-list-menu:0.3'],
        dataSelRole: 'publishVanity',
        buttonIcon: <Publish/>,
        buttonLabel: 'site-settings-seo:label.actions.publish',
        component: PublishVanityAction
    });

    registry.addOrReplace('action', 'deleteVanity', {
        targets: ['site-settings-seo/vanity-list-menu:0.4'],
        showOnNodeTypes: ['jnt:vanityUrl'],
        buttonIcon: <Delete/>,
        buttonLabel: 'site-settings-seo:label.actions.delete',
        component: DeleteVanityAction
    });

    registry.addOrReplace('action', 'undelete', registry.get('action', 'undelete'), {
        targets: ['site-settings-seo/vanity-list-menu:0.4']
    });

    registry.addOrReplace('action', 'deletePermanently', registry.get('action', 'deletePermanently'), {
        targets: ['site-settings-seo/vanity-list-menu:0.5']
    });

    registry.add('action', 'publishAllVanity', {
        component: PublishAllAction,
        targets: ['vanity-url/header'],
        buttonIcon: <CloudUpload/>,
        buttonProps: {color: 'accent'},
        label: 'site-settings-seo:label.actions.publishVanityUrl',
        dataSelRole: 'publish-all-vanitys'
    });
};
