import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import EditVanityUrlsDialog from '../EditvanityUrlsDialog'

const Action = ({siteInfo, nodeData, render: Render, label, requiredPermission, loading: Loading, language, showOnNodeTypes, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const res = useNodeChecks(
        {path: nodeData.path, language: language},
        {requiredPermission: requiredPermission, showOnNodeTypes: showOnNodeTypes}
    );

    if (res.loading) {
        return (Loading && <Loading {...otherProps}/>) || <></>;
    }

    const closeDialog = () => {
        componentRenderer.destroy('VanityUrlsDialog');
    };

    const openModal = () => {
        componentRenderer.render(
            'VanityUrlsDialog',
            EditVanityUrlsDialog,
            {
                nodeData: nodeData,
                isOpen: true,
                onCloseDialog: closeDialog
            });
    };

    return (
        <>
            <Render
                {...otherProps}
                buttonLabel={label}
                isVisible={res.checksResult}
                onClick={openModal}/>
        </>
    )
};

export default {
    component: Action
}
