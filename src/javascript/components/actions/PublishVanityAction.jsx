import React, {useEffect, useState} from 'react';
import * as PropTypes from 'prop-types';
import {allNotPublishedAndMarkedForDeletion, atLeastOneNotPublished, contentIsVisibleInLive} from '../Utils/Utils';
import {useApolloClient} from '@apollo/client';
import {GetPublicationStatus} from '~/components/gqlQueries';

export const PublishVanityAction = ({render: Render, actions, urlPairs, ...otherProps}) => {
    const onClick = e => {
        actions.publishAction.call(urlPairs, e);
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
                onClick={onClick}/>
        </>
    );
};

PublishVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    actions: PropTypes.object,
    urlPairs: PropTypes.array.isRequired
};
