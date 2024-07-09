import React, {useEffect, useState} from 'react';
import {useQuery, useApolloClient} from '@apollo/client';
import {ContentEditorTableQuery, GetPublicationStatus} from '~/components/gqlQueries';
import {PublishMutation} from '../gqlMutations';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from '../Context/VanityUrl.context';
import {useNotifications} from '@jahia/react-material';
import {useTranslation} from 'react-i18next';
import {atLeastOneLockedForValidation, buildTableQueryVariablesOneNode, contentIsVisibleInLive} from '../Utils/Utils';
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
        const fetchPublicationData = async urls => {
            const publicationData = await Promise.all(
                urls.map(async urlPair => {
                    const {data: currentData} = await client.query({
                        query: GetPublicationStatus,
                        variables: {path: urlPair.targetNodePath, language: urlPair.vanityLanguage}
                    });
                    console.debug(currentData);
                    return currentData.jcr.nodeByPath.aggregatedPublicationInfo;
                })
            );
            setIsVisibleInLive(publicationData.every(contentIsVisibleInLive));
        };

        if (nodeData.urls) {
            fetchPublicationData(nodeData.urls.map(url => {
                return {targetNodePath: url.default.targetNode.path, vanityLanguage: url.default.language};
            }));
        } else if (data) {
            fetchPublicationData(data.jcr.nodeByPath.vanityUrls.map(url => {
                return {targetNodePath: url.targetNode.path, vanityLanguage: url.language};
            }));
        }
    },
    [client, nodeData, nodeData.urls, data]
    );

    if (loading) {
        return (Loading && <Loading buttonLabel={label} {...otherProps}/>) || <></>;
    }

    if (error) {
        return <>error</>;
    }

    const unpublishedVanityUrlIds = data?.jcr?.nodeByPath?.vanityUrls
        .filter(vanityUrl => vanityUrl.publicationInfo.publicationStatus !== 'PUBLISHED')
        .map(vanityUrl => vanityUrl.uuid);

    const openPublicationWorkflow = () => {
        window.authoringApi.openPublicationWorkflow(
            unpublishedVanityUrlIds,
            false, // Not publishing all subNodes (AKA sub pages)
            false, // Not publishing all language
            false // Not unpublish action
        );
    };

    const publish = () => {
        client.mutate({
            mutation: PublishMutation,
            variables: {pathsOrIds: unpublishedVanityUrlIds, publishSubNodes: false}
        }).then(() => {
            notificationContext.notify(t('label.notifications.publicationStarted'), ['closeAfter5s']);
        });
    };

    let requestPublicationLabel = null;
    let action = publish;
    if (!data.jcr.nodeByPath.hasPublishPermission && data.jcr.nodeByPath.hasPublicationStartPermission) {
        requestPublicationLabel = 'site-settings-seo:label.actions.requestPublication';
        action = openPublicationWorkflow;
    }

    const isLockedForValidation = atLeastOneLockedForValidation(data.jcr.nodeByPath.vanityUrls);
    return (
        <>
            <div className={classes.container}>
                {unpublishedVanityUrlIds && <Render
                    {...otherProps}
                    disabled={unpublishedVanityUrlIds.length === 0 || !isVisibleInLive || isLockedForValidation}
                    buttonLabel={requestPublicationLabel || label}
                    onClick={action}/>}
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
