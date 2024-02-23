import React from 'react';
import {useQuery, useApolloClient} from '@apollo/client';
import {ContentEditorTableQuery} from '~/components/gqlQueries';
import {PublishMutation} from '../gqlMutations';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from '../Context/VanityUrl.context';
import {withNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {buildTableQueryVariablesOneNode} from '../Utils/Utils';
import {flowRight as compose} from 'lodash';

const PublishAllActionCmp = ({render: Render, loading: Loading, label, nodeData, notificationContext, ...otherProps}) => {
    const vanityUrlContext = useVanityUrlContext();
    const client = useApolloClient();
    const {t} = useTranslation('site-settings-seo');

    const {data, loading, error} = useQuery(ContentEditorTableQuery, {
        fetchPolicy: 'network-only',
        variables: buildTableQueryVariablesOneNode({
            path: nodeData.path,
            lang: window.contextJsParameters.lang,
            selectedLanguageCodes: vanityUrlContext.languages.map(language => language.language), ...nodeData
        })
    });

    if (loading) {
        return (Loading && <Loading buttonLabel={label} {...otherProps}/>) || <></>;
    }

    if (error) {
        return <>error</>;
    }

    const unpublishedVanityUrlIds = data?.jcr?.nodeByPath?.vanityUrls
        .filter(vanityUrl => vanityUrl.publicationInfo.publicationStatus !== 'PUBLISHED')
        .map(vanityUrl => vanityUrl.uuid);

    const publish = () => {
        client.mutate({mutation: PublishMutation, variables: {pathsOrIds: unpublishedVanityUrlIds, publishSubNodes: false}}).then(() => {
            notificationContext.notify(t('label.notifications.publicationStarted'), ['closeAfter5s']);
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

export const PublishAllAction = compose(withNotifications())(PublishAllActionCmp);

PublishAllActionCmp.propTypes = {
    render: PropTypes.elementType.isRequired,
    loading: PropTypes.object,
    nodeData: PropTypes.object,
    label: PropTypes.string.isRequired,
    notificationContext: PropTypes.func
};
