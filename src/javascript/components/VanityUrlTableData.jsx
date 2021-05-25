import React from 'react';
import {Query} from 'react-apollo';
import {withNotifications, ProgressOverlay} from '@jahia/react-material';
import * as _ from 'lodash';
import {TableQuery, TableQueryVariables} from './gqlQueries';
import {withTranslation} from 'react-i18next';
import {gqlContentNodeToVanityUrlPairs} from './utils';

class VanityUrlTableData extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {t, filterText, totalCount, pageSize, poll, notificationContext} = this.props;

        return (
            <Query fetchPolicy="network-only" query={TableQuery} variables={TableQueryVariables(this.props)} pollInterval={poll}>
                { ({loading, error, data}) => {
                if (error) {
                    console.log('Error when fetching data: ' + error);
                    notificationContext.notify(t('label.errors.loadingVanityUrl'), ['closeButton', 'noAutomaticClose']);
                }

                let numberOfPages = 0;
                let rows = [];
                if (data && data.jcr && data.jcr.nodesByQuery) {
                    totalCount = data.jcr.nodesByQuery.pageInfo.totalCount;
                    numberOfPages = (data.jcr.nodesByQuery.pageInfo.totalCount / pageSize);

                    rows = _.map(data.jcr.nodesByQuery.nodes, contentNode => {
                        let urlPairs = gqlContentNodeToVanityUrlPairs(contentNode, 'vanityUrls');
                        let allUrlPairs;
                        if (filterText) {
                            allUrlPairs = gqlContentNodeToVanityUrlPairs(contentNode, 'allVanityUrls');
                            urlPairs = _.filter(allUrlPairs, urlPair => _.find(urlPairs, url => url.uuid === urlPair.uuid));
                        }

                        return {
                            path: contentNode.path,
                            uuid: contentNode.uuid,
                            displayName: contentNode.displayName,
                            urls: urlPairs,
                            allUrls: allUrlPairs
                        };
                    });
                }

                return (
                    <>
                        {loading && <ProgressOverlay/>}
                        {this.props.children(rows, totalCount, numberOfPages)}
                    </>
);
            }}
            </Query>
        );
    }
}

VanityUrlTableData = _.flowRight(
    withNotifications(),
    withTranslation('site-settings-seo')
)(VanityUrlTableData);

export {VanityUrlTableData};
