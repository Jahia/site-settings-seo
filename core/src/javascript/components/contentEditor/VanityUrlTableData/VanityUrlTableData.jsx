import React from 'react';
import {useQuery} from 'react-apollo';
import {useNotifications} from '@jahia/react-material';
import {TableQuery} from './gqlQueries';
import {useTranslation} from 'react-i18next';
import {buildTableQueryVariablesOneNode, gqlContentNodeToVanityUrlPairs} from '../../Utils/Utils';
import * as PropTypes from 'prop-types';

export const VanityUrlTableData = ({poll, children, ...props}) => {
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');
    const {data, error} = useQuery(TableQuery, {
        fetchPolicy: 'network-only',
        variables: buildTableQueryVariablesOneNode(props),
        pollInterval: poll
    });

    if (error) {
        notificationContext.notify(t('label.errors.loadingVanityUrl'), ['closeButton', 'noAutomaticClose']);
        return <>error</>;
    }

    const rows = data?.jcr?.nodesByQuery?.nodes?.map(node => {
        return {
            path: node.path,
            uuid: node.uuid,
            displayName: node.displayName,
            urls: gqlContentNodeToVanityUrlPairs(node, 'vanityUrls')
        };
    });

    return (
        <>
            {rows && children(rows)}
        </>
    );
};

VanityUrlTableData.propTypes = {
    poll: PropTypes.number,
    children: PropTypes.func
};
