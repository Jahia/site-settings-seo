import React, {useContext} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useNodeChecks} from '@jahia/data-helper';
import {SiteSettingsSeoCardEntry} from '../SiteSettingsSeo/SiteSettingsSeoCardEntry';
import * as PropTypes from 'prop-types';

let useContentEditorContext;
import('@jahia/content-editor').then(v => {
    useContentEditorContext = v.useContentEditorContext;
}).catch(e => console.warn('Error loading context from content-editor', e));

export const VanityAction = ({render: Render, loading: Loading, label, requiredPermission, showOnNodeTypes, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const {mode, nodeData, lang, language} = useContentEditorContext ? useContentEditorContext() : otherProps;
    const {loading, checksResult} = useNodeChecks(
        {path: nodeData.path, language: lang | language},
        {requiredPermission: requiredPermission, showOnNodeTypes: showOnNodeTypes}
    );

    if (loading) {
        return (Loading && <Loading buttonLabel={label} {...otherProps}/>) || <></>;
    }

    const closeDialog = () => {
        componentRenderer.destroy('VanityUrlsDialog');
    };

    const openModal = () => {
        componentRenderer.render(
            'VanityUrlsDialog',
            SiteSettingsSeoCardEntry,
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
                isVisible={checksResult}
                onClick={openModal}/>
        </>
    );
};

VanityAction.propTypes = {
    render: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    requiredPermission: PropTypes.string.isRequired,
    showOnNodeTypes: PropTypes.array.isRequired
};
