import React, {useContext} from 'react';
import {useQuery} from '@apollo/client';
import {withNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {gqlContentNodeToVanityUrlPairs} from './Utils/Utils';
import * as PropTypes from 'prop-types';
import {flowRight as compose} from 'lodash';

export const VanityUrlTableDataContext = React.createContext({});
export const useVanityTableDataUrlContext = () => useContext(VanityUrlTableDataContext);

export const VanityUrlTableDataCmp = ({filterText, totalCount, pageSize, poll, children, tableQuery, variables, notificationContext}) => {
    const {t} = useTranslation('site-settings-seo');
    const {data, error, loading} = useQuery(tableQuery, {
        fetchPolicy: 'network-only',
        variables: variables,
        pollInterval: poll
    });

    if (loading) {
        return <></>;
    }

    if (error) {
        console.log('Error when fetching data: ' + error);
        notificationContext.notify(t('label.errors.loadingVanityUrl'), ['closeButton', 'noAutomaticClose']);
        return <>error</>;
    }

    let numberOfPages = 0;
    let rows = [];
    let nodes = [];
    if (data?.jcr) {
        if (data.jcr.nodeByPath && (data.jcr.nodeByPath.vanityUrls?.length || data.jcr.nodeByPath?.liveNode?.vanityUrls?.length)) {
            nodes.push(data.jcr.nodeByPath);
        } else if (data.jcr.nodesByQuery?.nodes) {
            nodes = data.jcr.nodesByQuery.nodes;
            totalCount = data.jcr.nodesByQuery.pageInfo.totalCount;
            numberOfPages = totalCount / pageSize;
        }

        rows = nodes.map(node => {
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
                hasWritePermission: node.hasWritePermission,
                urls: urlPairs,
                allUrls: allUrlPairs
            };
        });
    }

    const context = {rows: rows};
    return (
        <VanityUrlTableDataContext.Provider value={context}>
            {rows && children(rows, totalCount, numberOfPages)}
        </VanityUrlTableDataContext.Provider>
    );
};

export const VanityUrlTableData = compose(withNotifications())(VanityUrlTableDataCmp);

VanityUrlTableDataCmp.propTypes = {
    tableQuery: PropTypes.object,
    variables: PropTypes.object,
    filterText: PropTypes.string,
    totalCount: PropTypes.number,
    pageSize: PropTypes.number,
    poll: PropTypes.number,
    children: PropTypes.elementType,
    notificationContext: PropTypes.func
};
