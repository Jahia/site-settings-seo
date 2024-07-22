import React from 'react';
import PropTypes from 'prop-types';
import {Component, Children} from 'react';
import {graphql} from '@apollo/react-hoc';
import {flowRight as compose} from 'lodash';
import * as gqlMutations from './gqlMutations';
import {
    InvalidMappingError,
    InvalidCharError,
    SitesMappingError
} from './Errors';
import {containsInvalidChars, isBlankUrl, isSitesUrl} from '~/components/Utils/Utils';

class VanityMutationsProvider extends Component {
    constructor(props) {
        super(props);
        this.addMutations();
    }

    addMutations() {
        const {vanityMutationsContext, updateMutation} = this.props;


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
                    lang: window.contextJsParameters.lang
                }
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
                return (
                    <WrappedComponent vanityMutationsContext={this.context.vanityMutationsContext} {...this.props}/>);
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
    graphql(gqlMutations.UpdateVanityMutation, {name: 'updateMutation'})
)(VanityMutationsProvider);

export {VanityMutationsProvider, withVanityMutationContext};
