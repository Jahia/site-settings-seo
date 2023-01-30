import React from 'react';
import {useQuery} from 'react-apollo';
import {useNotifications} from '@jahia/react-material';
import {TableQuery} from './gqlQueries';
import {useTranslation} from 'react-i18next';
import {buildTableQueryVariablesAllVanity, gqlContentNodeToVanityUrlPairs} from './Utils/Utils';
import * as PropTypes from 'prop-types';

export const VanityUrlTableData = ({filterText, totalCount, pageSize, poll, children, ...props}) => {
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');
    const {data, error} = useQuery(TableQuery, {
        fetchPolicy: 'network-only',
        variables: buildTableQueryVariablesAllVanity({filterText: filterText, totalCount: totalCount, pageSize: pageSize, ...props}),
        pollInterval: poll
    });

    if (error) {
        console.log('Error when fetching data: ' + error);
        notificationContext.notify(t('label.errors.loadingVanityUrl'), ['closeButton', 'noAutomaticClose']);
        return <>error</>;
    }

    let numberOfPages = 0;
    let rows = [];
    if (data && data.jcr && data.jcr.nodesByQuery) {
        if (data.jcr.nodesByQuery.pageInfo) {
            totalCount = data.jcr.nodesByQuery.pageInfo.totalCount;
            numberOfPages = (data.jcr.nodesByQuery.pageInfo.totalCount / pageSize);
        }

        rows = data.jcr.nodesByQuery.nodes.map(node => {
            let urlPairs = gqlContentNodeToVanityUrlPairs(node, 'vanityUrls');
            let allUrlPairs;
            if (filterText) {
                allUrlPairs = gqlContentNodeToVanityUrlPairs(node, 'allVanityUrls');
                urlPairs = allUrlPairs.filter(pairFromAllPair => urlPairs.find(urlPair => pairFromAllPair.uuid === urlPair.uuid));
            }

            return {
                path: node.path,
                uuid: node.uuid,
                displayName: node.displayName,
                urls: urlPairs,
                allUrls: allUrlPairs
            };
        });
    }

    return (<>{rows && children(rows, totalCount, numberOfPages)}</>);
};

VanityUrlTableData.propTypes = {
    filterText: PropTypes.string,
    totalCount: PropTypes.number,
    pageSize: PropTypes.number,
    poll: PropTypes.number,
    children: PropTypes.elementType
};
