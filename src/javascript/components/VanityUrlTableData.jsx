import React, {useContext} from 'react';
import {useQuery} from '@apollo/client';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {gqlContentNodeToVanityUrlPairs} from './Utils/Utils';
import * as PropTypes from 'prop-types';

export const VanityUrlTableDataContext = React.createContext({});
export const useVanityTableDataUrlContext = () => useContext(VanityUrlTableDataContext);

export const VanityUrlTableData = ({filterText, totalCount, children, tableQuery, variables}) => {
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');
    const {data, error, loading, refetch} = useQuery(tableQuery, {
        fetchPolicy: 'network-only',
        variables: variables
    });

    if (error) {
        console.log('Error when fetching data: ' + error);
        notificationContext.notify(t('label.errors.loadingVanityUrl'), ['closeButton', 'noAutomaticClose']);
        return <>error</>;
    }

    let rows = [];
    let nodes = [];
    if (data?.jcr) {
        if (data.jcr.nodeByPath && (data.jcr.nodeByPath.vanityUrls?.length || data.jcr.nodeByPath?.liveNode?.vanityUrls?.length)) {
            nodes.push(data.jcr.nodeByPath);
        } else if (data.jcr.nodesByCriteria?.nodes) {
            nodes = data.jcr.nodesByCriteria.nodes;
            totalCount = data.jcr.nodesByCriteria.pageInfo.totalCount;
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

    const context = {rows: rows, refetch: refetch};
    return (
        <VanityUrlTableDataContext.Provider value={context}>
            {rows && children({rows: rows, totalCount: totalCount, loading: loading})}
        </VanityUrlTableDataContext.Provider>
    );
};

VanityUrlTableData.propTypes = {
    tableQuery: PropTypes.object,
    variables: PropTypes.object,
    filterText: PropTypes.string,
    totalCount: PropTypes.number,
    children: PropTypes.elementType
};
