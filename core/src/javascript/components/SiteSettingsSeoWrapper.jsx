import React from 'react';
import {MuiThemeProvider} from '@material-ui/core';
import {ProgressOverlay, NotificationProvider, legacyTheme} from '@jahia/react-material';
import {VanityMutationsProvider} from './VanityMutationsProvider';
import {VanityUrlContextProvider} from './Context/VanityUrl.context';
import * as PropTypes from 'prop-types';

export const SiteSettingsSeoWrapper = ({dxContext, component: Component, ...props}) => {
    if (!dxContext.siteKey) {
        return <ProgressOverlay/>;
    }

    return (
        <MuiThemeProvider theme={legacyTheme}>
            <VanityUrlContextProvider siteKey={dxContext.siteKey}>
                <NotificationProvider notificationContext={{}}>
                    <VanityMutationsProvider lang={dxContext.lang} vanityMutationsContext={{}}>
                        <Component {...dxContext} {...props}/>
                    </VanityMutationsProvider>
                </NotificationProvider>
            </VanityUrlContextProvider>
        </MuiThemeProvider>
    );
};

SiteSettingsSeoWrapper.propTypes = {
    dxContext: PropTypes.object.isRequired,
    component: PropTypes.elementType.isRequired
};
