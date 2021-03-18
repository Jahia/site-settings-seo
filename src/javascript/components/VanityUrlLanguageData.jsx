import React from 'react';
import {Query} from 'react-apollo';
import * as _ from 'lodash';
import {LanguagesQuery} from './gqlQueries';

class VanityUrlLanguageData extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Query fetchPolicy="network-only" query={LanguagesQuery} variables={{path: this.props.path}}>
                { ({loading, error, data}) => {
                let languages = [];
                if (data.jcr && data.jcr.nodeByPath) {
                    languages = _.sortBy(_.filter(data.jcr.nodeByPath.site.languages, language => language.activeInEdit), 'code');
                }

                return this.props.children(languages);
            }}
            </Query>
        );
    }
}

export {VanityUrlLanguageData};
