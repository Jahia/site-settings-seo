import React from 'react';
import PropTypes from 'prop-types';
import {Component, Children} from 'react';
import {graphql} from 'react-apollo/lib/index';
import {flowRight as compose} from 'lodash';
import * as gqlMutations from './gqlMutations';
import * as _ from 'lodash';
import {TableQuery, TableQueryVariables, VanityUrlsByPath, VanityUrlsByPathVariables} from './gqlQueries';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';
import {
    InvalidMappingError,
    InvalidCharError,
    MoveSiteError,
    DuplicateMappingError,
    AddMappingsError,
    SitesMappingError
} from './Errors';

class VanityMutationsProvider extends Component {
    constructor(props) {
        super(props);
        this.addMutations();
    }

    addMutations() {
        const {vanityMutationsContext, deleteMutation, moveMutation, updateMutation, publishMutation, addMutation} = this.props;

        const isSitesUrl = url => {
            const isString = (typeof url === 'string') || url instanceof String;
            return (isString && SiteSettingsSeoConstants.SITES_REG_EXP.test(url.trim()));
        };

        const isBlankUrl = url => {
            const isString = (typeof url === 'string') || url instanceof String;
            return (isString && !url.trim());
        };

        const containsInvalidChars = url => {
            const isString = (typeof url === 'string') || url instanceof String;
            return (isString && SiteSettingsSeoConstants.INVALID_CHARS_REG_EXP.test(url.trim()));
        };

        vanityMutationsContext.delete = (pathsOrIds, props) => deleteMutation({
            variables: {
                pathsOrIds: pathsOrIds,
                lang: props.lang
            }, refetchQueries: [{
                query: TableQuery,
                variables: TableQueryVariables(props)
            }]
        });

        vanityMutationsContext.move = (pathsOrIds, target, props) => {
            if (!_.startsWith(target, props.path)) {
                throw new MoveSiteError('Moving vanity mapping in an other site is not allowed');
            }

            return moveMutation({
                variables: {
                    pathsOrIds: pathsOrIds,
                    target: target
                }, refetchQueries: [{
                    query: TableQuery,
                    variables: TableQueryVariables(props)
                }]
            });
        };

        vanityMutationsContext.publish = (pathsOrIds, nodeOnly) => publishMutation({
            variables: {
                pathsOrIds: pathsOrIds,
                publishSubNodes: !nodeOnly
            }
        });

        vanityMutationsContext.update = (ids, defaultMapping, active, language, url) => {
            if (isBlankUrl(url)) {
                throw new InvalidMappingError(url);
            }

            if (containsInvalidChars(url)) {
                throw new InvalidCharError(url);
            }

            if (isSitesUrl(url)) {
                throw new SitesMappingError(url);
            }

            return updateMutation({
                variables: {
                    ids: ids,
                    defaultMapping: language ? false : defaultMapping,
                    active: active,
                    language: language,
                    url: url,
                    lang: this.props.lang
                }
            });
        };

        vanityMutationsContext.add = (path, vanityUrls = [], props) => {
            let invalidMappings = vanityUrls.filter(v => isBlankUrl(v.url));
            let sitesMappings = vanityUrls.filter(v => isSitesUrl(v.url));
            let invalidCharMappings = vanityUrls.filter(v => containsInvalidChars(v.url));
            let duplicateUrls = vanityUrls;
            duplicateUrls = _.pullAllBy(duplicateUrls, [...invalidMappings, ...sitesMappings, ...invalidCharMappings], 'url');
            duplicateUrls = _.groupBy(duplicateUrls, 'url');
            duplicateUrls = _.pickBy(duplicateUrls, x => x.length > 1);
            duplicateUrls = _.keys(duplicateUrls);

            let errors = [
                ...invalidMappings.map(v => new InvalidMappingError(v.url)),
                ...invalidCharMappings.map(v => new InvalidCharError(v.url)),
                ...sitesMappings.map(v => new SitesMappingError(v.url)),
                ...duplicateUrls.map(v => new DuplicateMappingError(v.url))
            ];

            if (errors.length > 0) {
                throw new AddMappingsError(errors);
            }

            return addMutation({
                variables: {
                    vanityUrls: vanityUrls,
                    path: path,
                    lang: props.lang
                }, refetchQueries: [{
                    query: VanityUrlsByPath,
                    variables: VanityUrlsByPathVariables(path, props)
                }]
            });
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.addMutations();
    }

    getChildContext() {
        return {
            vanityMutationsContext: this.props.vanityMutationsContext
        };
    }

    render() {
        return Children.only(this.props.children);
    }
}

function withVanityMutationContext() {
    return WrappedComponent => {
        let Component = class extends React.Component {
            render() {
                return (<WrappedComponent vanityMutationsContext={this.context.vanityMutationsContext} {...this.props}/>);
            }
        };

        Component.contextTypes = {
            vanityMutationsContext: PropTypes.object
        };

        return Component;
    };
}

VanityMutationsProvider.propTypes = {
    vanityMutationsContext: PropTypes.object.isRequired
};

VanityMutationsProvider.childContextTypes = {
    vanityMutationsContext: PropTypes.object.isRequired
};

VanityMutationsProvider = compose(
    graphql(gqlMutations.DeleteVanity, {name: 'deleteMutation'}),
    graphql(gqlMutations.MoveMutation, {name: 'moveMutation'}),
    graphql(gqlMutations.PublishMutation, {name: 'publishMutation'}),
    graphql(gqlMutations.UpdateVanityMutation, {name: 'updateMutation'}),
    graphql(gqlMutations.AddVanityMutation, {name: 'addMutation'})
)(VanityMutationsProvider);

export {VanityMutationsProvider, withVanityMutationContext};
