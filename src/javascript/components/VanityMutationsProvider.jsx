import React from 'react';
import PropTypes from 'prop-types';
import {Component, Children} from 'react';
import {graphql} from 'react-apollo/lib/index';
import {flowRight as compose} from 'lodash';
import * as gqlMutations from './gqlMutations';
import * as _ from 'lodash';
import {TableQuery, TableQueryVariables, VanityUrlsByPath, VanityUrlsByPathVariables} from './gqlQueries';
import {SiteSettingsSeoConstants} from './SiteSettingsSeo';
import {InvalidMappingError, MoveSiteError, DuplicateMappingError, AddMappingsError} from './Errors';

class VanityMutationsProvider extends Component {
    constructor(props) {
        super(props);

        let {vanityMutationsContext, deleteMutation, moveMutation, updateMutation, publishMutation, addMutation} = this.props;

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
            if (url && !SiteSettingsSeoConstants.MAPPING_REG_EXP.test(url)) {
                throw new InvalidMappingError(url);
            }

            return updateMutation({
                variables: {
                    ids: ids,
                    defaultMapping: language ? false : defaultMapping,
                    active: active,
                    language: language,
                    url: url,
                    lang: props.lang
                }
            });
        };

        vanityMutationsContext.add = (path, vanityUrls, props) => {
            let invalidMappings = _.filter(vanityUrls, mapping => !SiteSettingsSeoConstants.MAPPING_REG_EXP.test(mapping.url));
            let duplicateUrls = vanityUrls;
            duplicateUrls = _.pullAllBy(duplicateUrls, invalidMappings, 'url');
            duplicateUrls = _.groupBy(duplicateUrls, 'url');
            duplicateUrls = _.pickBy(duplicateUrls, x => x.length > 1);
            duplicateUrls = _.keys(duplicateUrls);

            let errors = [];
            _.each(invalidMappings, invalidMapping => errors.push(new InvalidMappingError(invalidMapping.url)));
            _.each(duplicateUrls, duplicateUrl => errors.push(new DuplicateMappingError(duplicateUrl)));

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
