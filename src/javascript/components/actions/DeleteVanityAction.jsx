import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React from 'react';
import {isMarkedForDeletion} from '../Utils/Utils';
import {useVanityUrlContext} from '../Context/VanityUrl.context';

function checkAction(node) {
    return node.operationsSupport.markForDeletion && !isMarkedForDeletion(node);
}

export const DeleteVanityAction = ({path, paths, buttonProps, render: Render, loading: Loading, ...others}) => {
    const {lang: language} = useVanityUrlContext();

    const res = useNodeChecks(
        {path, paths, language},
        {
            getProperties: ['jcr:mixinTypes'],
            getDisplayName: true,
            getOperationSupport: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite']
        },
        {fetchPolicy: 'network-only'}
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && (res.node ? checkAction(res.node) : res.nodes.reduce((acc, node) => acc && checkAction(node), true));

    return (
        <Render
            {...others}
            isVisible={isVisible}
            buttonProps={{...buttonProps, color: 'danger'}}
            enabled={isVisible}
            onClick={() => {
                if (res.node) {
                    window.authoringApi.deleteContent(res.node.uuid, res.node.path, res.node.displayName, ['jnt:content'], ['nt:base'], false, false);
                } else if (res.nodes) {
                    window.authoringApi.deleteContents(res.nodes.map(node => ({
                        uuid: node.uuid,
                        path: node.path,
                        displayName: node.displayName,
                        nodeTypes: ['jnt:content'],
                        inheritedNodeTypes: ['nt:base']
                    })), false, false);
                }
            }}
        />
    );
};

DeleteVanityAction.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
