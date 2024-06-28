import React, {useContext, useEffect, useState} from 'react';
import {ComponentRendererContext} from '@jahia/ui-extender';
import * as PropTypes from 'prop-types';
import {allNotPublishedAndMarkedForDeletion, atLeastOneNotPublished, contentIsVisibleInLive} from '../Utils/Utils';
import {useApolloClient} from '@apollo/client';
import {GetPublicationStatus} from '~/components/gqlQueries';
import {Publication} from '~/components/Publication/Publication';

export const PublishVanityAction = ({render: Render, urlPairs, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);

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

    const [isVisibleInLive, setIsVisibleInLive] = useState(false);
    const client = useApolloClient();

    useEffect(() => {
        const fetchPublicationData = async () => {
            const data = await Promise.all(
                urlPairs.map(async urlPair => {
                    const {data} = await client.query({
                        query: GetPublicationStatus,
                        variables: {path: urlPair.default.targetNode.path, language: urlPair.default.language}
                    });
                    console.debug(data);
                    return data.jcr.nodeByPath.aggregatedPublicationInfo;
                })
            );
            setIsVisibleInLive(data.every(contentIsVisibleInLive));
        };

        fetchPublicationData();
    }, [client, urlPairs, urlPairs.length]);

    const shouldBeVisible = !allNotPublishedAndMarkedForDeletion(urlPairs) && atLeastOneNotPublished(urlPairs) && isVisibleInLive;
    return (
        <>
            <Render
                {...otherProps}
                isVisible={shouldBeVisible}
                onClick={openModal}/>
        </>
    );
};

PublishVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    urlPairs: PropTypes.array.isRequired
};
