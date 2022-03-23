import React from 'react';
import {Query} from 'react-apollo';
import * as _ from 'lodash';
import {LanguagesQuery} from './gqlQueries';
import {ProgressOverlay, withNotifications} from '@jahia/react-material';
import {withTranslation} from 'react-i18next';

class VanityUrlLanguageDataComp extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Query fetchPolicy="network-only" query={LanguagesQuery} variables={{path: this.props.path}}>
                { ({loading, error, data}) => {
                    if (error) {
                        console.log('Error when fetching data: ' + error);
                        this.props.notificationContext.notify(this.props.t('label.errors.loadingVanityUrl'), ['closeButton', 'noAutomaticClose']);
                    }

                    if (loading) {
                        return <ProgressOverlay/>;
                    }

                    let languages = [];

                    if (data && data.jcr && data.jcr.nodeByPath) {
                        languages = _.sortBy(_.filter(data.jcr.nodeByPath.site.languages, language => language.activeInEdit), 'code');
                    }

                    return this.props.children(languages);
            }}
            </Query>
        );
    }
}

const VanityUrlLanguageData = _.flowRight(
    withNotifications(),
    withTranslation('site-settings-seo')
)(VanityUrlLanguageDataComp);

export {VanityUrlLanguageData};
