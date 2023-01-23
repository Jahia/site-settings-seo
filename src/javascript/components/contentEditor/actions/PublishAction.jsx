import React from 'react';
import {useQuery} from 'react-apollo';
import {useApolloClient} from '@apollo/react-hooks';
import {TableQuery} from '../VanityUrlTableData/gqlQueries';
import {PublishMutation} from '../../gqlMutations';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from '../../Context/VanityUrl.context';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {buildTableQueryVariablesOneNode} from '../../Utils/Utils';

export const PublishAction = ({render: Render, loading: Loading, label, nodeData, ...otherProps}) => {
    const vanityUrlContext = useVanityUrlContext();
    const client = useApolloClient();
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');

    const {data, loading, error} = useQuery(TableQuery, {
        fetchPolicy: 'network-only',
        variables: buildTableQueryVariablesOneNode({
            lang: window.contextJsParameters.lang,
            selectedLanguageCodes: vanityUrlContext.languages.map(language => language.code), ...nodeData
        })
    });

    if (loading) {
        return (Loading && <Loading buttonLabel={label} {...otherProps}/>) || <></>;
    }

    if (error) {
        return <>error</>;
    }

    const unpublishedVanityUrlIds = data?.jcr?.nodesByQuery?.nodes[0]?.vanityUrls
        .filter(vanityUrl => vanityUrl.publicationInfo.publicationStatus !== 'PUBLISHED')
        .map(vanityUrl => vanityUrl.uuid);

    const publish = () => {
        client.mutate({mutation: PublishMutation, variables: {pathsOrIds: unpublishedVanityUrlIds, publishSubNodes: false}}).then(() => {
            notificationContext.notify(t('label.notifications.publicationStarted'));
        });
    };

    return (
        <>
            {unpublishedVanityUrlIds && <Render
                {...otherProps}
                disabled={unpublishedVanityUrlIds.length === 0}
                buttonLabel={label}
                onClick={publish}/>}
        </>
    );
};

PublishAction.propTypes = {
    render: PropTypes.object.isRequired,
    loading: PropTypes.object,
    nodeData: PropTypes.object,
    label: PropTypes.string.isRequired
};
