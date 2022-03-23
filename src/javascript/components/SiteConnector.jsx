import React from 'react';
import {SiteNodeQuery} from './gqlQueries';
import {Query} from 'react-apollo';
import {ProgressOverlay} from '@jahia/react-material';
import {connect} from 'react-redux';
import * as _ from 'lodash';

export const withSite = () => WrappedComponent => {
    const Comp = class extends React.Component {
        render() {
            if (!this.props.siteKey) {
                return <ProgressOverlay/>;
            }

            return (
                <Query fetchPolicy="network-only" query={SiteNodeQuery} variables={{sitePath: `/sites/${this.props.siteKey}`}}>
                    {
                        ({error, loading, data}) => {
                            if (error) {
                                console.error(error);
                                return 'There was an Error, see console';
                            }

                            if (loading) {
                                return <ProgressOverlay/>;
                            }

                            const site = data.jcr.nodeByPath;
                            const context = {
                                siteTitle: site.displayName,
                                mainResourceId: site.uuid,
                                mainResourcePath: site.path
                            };
                            const props = {
                                ...this.props,
                                dxContext: {
                                    ...this.props.dxContext,
                                    ...context
                                }
                            };

                            return <WrappedComponent {...props}/>;
                        }
                    }
                </Query>
            );
        }
    };

    return _.flowRight(
        connect(state => ({siteKey: state.site}))
    )(Comp);
};
