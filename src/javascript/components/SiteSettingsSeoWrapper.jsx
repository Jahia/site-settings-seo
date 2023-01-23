import React from 'react';
import {MuiThemeProvider} from '@material-ui/core';
import {ProgressOverlay, NotificationProvider, legacyTheme} from '@jahia/react-material';
import * as _ from 'lodash';
import {VanityMutationsProvider} from './VanityMutationsProvider';
import {withSite} from './SiteConnector';
import {VanityUrlContextProvider} from './Context/VanityUrl.context';

const SiteSettingsSeo = _.flowRight(
    withSite()
)(function (props) {
    if (!props.dxContext.mainResourcePath) {
        return <ProgressOverlay/>;
    }

    const {component: Component, ...otherProps} = props;

    return (
        <MuiThemeProvider theme={legacyTheme}>
            <VanityUrlContextProvider path={props.dxContext.mainResourcePath}>
                <NotificationProvider notificationContext={{}}>
                    <VanityMutationsProvider lang={props.dxContext.lang} vanityMutationsContext={{}}>
                        <Component {...otherProps}/>
                    </VanityMutationsProvider>
                </NotificationProvider>
            </VanityUrlContextProvider>
        </MuiThemeProvider>
    );
});

export default SiteSettingsSeo;
