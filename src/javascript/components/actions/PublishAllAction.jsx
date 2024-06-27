import React, {useEffect, useState} from 'react';
import {useQuery, useApolloClient} from '@apollo/client';
import {ContentEditorTableQuery, GetPublicationStatus} from '~/components/gqlQueries';
import {PublishMutation} from '../gqlMutations';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from '../Context/VanityUrl.context';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {buildTableQueryVariablesOneNode, contentIsVisibleInLive} from '../Utils/Utils';
import {Chip, Information} from '@jahia/moonstone';
import classes from './PublishAllAction.scss';

export const PublishAllAction = ({render: Render, loading: Loading, label, nodeData, ...otherProps}) => {
    const notificationContext = useNotifications();
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

    const [isVisibleInLive, setIsVisibleInLive] = useState(false);
    useEffect(() => {
        const fetchPublicationData = async () => {
            const data = await Promise.all(
                nodeData.urls.map(async urlPair => {
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
    }, [client, nodeData, nodeData.urls]);

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
        client.mutate({
            mutation: PublishMutation,
            variables: {pathsOrIds: unpublishedVanityUrlIds, publishSubNodes: false}
        }).then(() => {
            notificationContext.notify(t('label.notifications.publicationStarted'), ['closeAfter5s']);
        });
    };

    return (
        <>
            <div className={classes.container}>
                {unpublishedVanityUrlIds && <Render
                    {...otherProps}
                    disabled={unpublishedVanityUrlIds.length === 0 || !isVisibleInLive}
                    buttonLabel={label}
                    onClick={publish}/>}
                {!isVisibleInLive &&
                    <Chip icon={<Information size="default"/>}
                          className={classes.chipInfo}
                          label={t('label.messages.canNotPublishAll')}
                          title={t('label.messages.atLeastOneLanguageNotPublished')}
                          color="warning"/>}
            </div>
        </>
    );
};

PublishAllAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    loading: PropTypes.object,
    nodeData: PropTypes.object,
    label: PropTypes.string.isRequired
};
