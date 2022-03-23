import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import EditVanityUrlsDialog from '../EditvanityUrlsDialog'

export const VanityAction = ({render: Render, loading: Loading, label, requiredPermission, showOnNodeTypes, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const {mode, nodeData, language} = useContentEditorContext();
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
                nodeData,
                isOpen: true,
                onCloseDialog: closeDialog
            });
    };

    return (
        <>
            <Render
                enabled={mode !== 'create'}
                {...otherProps}
                mode={mode}
                buttonLabel={label}
                isVisible={res.checksResult}
                onClick={openModal}/>
        </>
    )
};
