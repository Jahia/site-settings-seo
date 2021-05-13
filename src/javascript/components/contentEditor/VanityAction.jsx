import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import EditVanityUrlsDialog from './EditVanityUrlsDialog'

const Action = ({siteInfo, nodeData, formik, language, render: Render, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);

    const closeDialog = () => {
        componentRenderer.destroy('VanityUrlsDialog');
    };

    const openModal = () => {
        componentRenderer.render(
            'VanityUrlsDialog',
            EditVanityUrlsDialog,
            {
                nodeData: nodeData,
                currentLanguage: language,
                isOpen: true,
                languages: siteInfo.languages,
                onCloseDialog: closeDialog,
                onApply: newWipInfo => {
                    closeDialog();
                }
            });
    };

    return (
        <>
            <Render
                {...otherProps}
                buttonLabel={'Vanity URLs'}
                // enabled={nodeData.hasWritePermission && !Constants.wip.notAvailableFor.includes(nodeData.primaryNodeType.name)}
                onClick={openModal}/>
        </>
    )
};

export default {
    component: Action
}
