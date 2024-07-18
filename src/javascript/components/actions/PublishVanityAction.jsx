import React, {useContext, useEffect, useState} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import * as PropTypes from 'prop-types';
import {allNotPublishedAndMarkedForDeletion, atLeastOneNotPublished, contentIsVisibleInLive} from '../Utils/Utils';
import {useApolloClient, useQuery} from '@apollo/client';
import {CheckPublishPermissions, GetPublicationStatus} from '~/components/gqlQueries';
import {Publication} from '~/components/Publication/Publication';

export const PublishVanityAction = ({render: Render, urlPairs, path, paths, buttonLabel, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);

    const {data, loading, error} = useQuery(CheckPublishPermissions,
        {
            variables:
                {
                    paths: paths ? paths : [path]
                }
        });

    const closeDialog = () => {
        componentRenderer.destroy('PublishVanityDialog');
    };

    const openModal = () => {
        componentRenderer.render(
            'PublishVanityDialog',
            Publication,
            {
                ...otherProps,
                urlPairs: urlPairs,
                isOpen: true,
                onClose: closeDialog
            });
    };

    const openPublicationWorkflow = () => {
        const uuids = urlPairs.map(urlPair => urlPair.uuid);
        window.authoringApi.openPublicationWorkflow(
            uuids,
            false, // Not publishing all subNodes (AKA sub pages)
            false, // Not publishing all language
            false // Not unpublish action
        );
    };

    const [isVisibleInLive, setIsVisibleInLive] = useState(false);
    const client = useApolloClient();

    useEffect(() => {
        const fetchPublicationData = async () => {
            const result = await Promise.all(
                urlPairs.map(async urlPair => {
                    const {data: publicationData} = await client.query({
                        query: GetPublicationStatus,
                        variables: {path: urlPair.default.targetNode.path, language: urlPair.default.language}
                    });
                    console.debug(publicationData);
                    return publicationData.jcr.nodeByPath.aggregatedPublicationInfo;
                })
            );
            setIsVisibleInLive(result.every(contentIsVisibleInLive));
        };

        fetchPublicationData();
    }, [client, urlPairs, urlPairs.length]);

    if (error) {
        console.log('Error while fetching publish permissions');
        console.debug(error);
        return null;
    }

    if (loading || !data) {
        return null;
    }

    let requestPublicationLabel = null;
    let action = openModal;
    const atLeastOneWithoutPublishPermission = data.jcr.nodesByPath.some(urlPair => !urlPair.hasPublishPermission);
    const everyHasPublicationStartPermission = data.jcr.nodesByPath.every(urlPair => urlPair.hasPublicationStartPermission);
    if (atLeastOneWithoutPublishPermission && everyHasPublicationStartPermission) {
        requestPublicationLabel = 'site-settings-seo:label.actions.requestPublication';
        action = openPublicationWorkflow;
    }

    const shouldBeVisible = !allNotPublishedAndMarkedForDeletion(urlPairs) && atLeastOneNotPublished(urlPairs) && isVisibleInLive;
    return (
        <>
            <Render
                {...otherProps}
                buttonLabel={requestPublicationLabel || buttonLabel}
                isVisible={shouldBeVisible}
                onClick={action}/>
        </>
    );
};

PublishVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    urlPairs: PropTypes.array.isRequired,
    path: PropTypes.string,
    paths: PropTypes.array,
    buttonLabel: PropTypes.string.isRequired
};
