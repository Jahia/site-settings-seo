import React from 'react';
import {useQuery} from 'react-apollo';
import {useApolloClient} from '@apollo/react-hooks';

import {TableQuery, TableQueryVariables} from '../VanityUrlTableData/gqlQueries';
import {PublishMutation} from '../../gqlMutations';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from '../../Context/VanityUrl.context';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';

export const PublishAction = ({render: Render, loading: Loading, label, nodeData, ...otherProps}) => {
    const vanityUrlContext = useVanityUrlContext();
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');

    const {data, loading, error} = useQuery(TableQuery, {
        variables: TableQueryVariables({
            lang: window.contextJsParameters.lang,
            pageSize: 10,
            currentPage: 0,
            filterText: '',
            selectedLanguageCodes: vanityUrlContext.languages, ...nodeData
        })
    });

    if (loading) {
        return (Loading && <Loading buttonLabel={label} {...otherProps}/>) || <></>;
    }

    if (error) {
        return <>error</>;
    }

    const unpublishedVanityUrlIds = data.jcr.nodesByQuery.nodes[0].vanityUrls
        .filter(vanityUrl => vanityUrl.publicationInfo.publicationStatus !== 'PUBLISHED')
        .map(vanityUrl => vanityUrl.uuid);

    const publish = () => {
        client.mutate({mutation: PublishMutation, variables: {pathsOrIds: unpublishedVanityUrlIds, publishSubNodes: false}}).then(() => {
            notificationContext.notify(t('label.notifications.publicationStarted'));
        });
    };

    return (
        <>
            <Render
                {...otherProps}
                disabled={unpublishedVanityUrlIds.length === 0}
                buttonLabel={label}
                onClick={publish}/>
        </>
    );
};

PublishAction.propTypes = {
    render: PropTypes.object.isRequired,
    loading: PropTypes.object,
    nodeData: PropTypes.object,
    label: PropTypes.string.isRequired
};
