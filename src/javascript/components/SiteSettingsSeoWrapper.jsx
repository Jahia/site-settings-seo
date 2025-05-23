import React from 'react';
import {MuiThemeProvider} from '@material-ui/core';
import {NotificationProvider, legacyTheme} from '@jahia/react-material';
import {VanityUrlContextProvider} from './Context/VanityUrl.context';
import * as PropTypes from 'prop-types';
import {shallowEqual, useSelector} from 'react-redux';

export const SiteSettingsSeoWrapper = ({dxContext, component: Component, ...props}) => {
    const {siteKey} = useSelector(state => ({
        siteKey: state.site
    }), shallowEqual);

    return (
        <MuiThemeProvider theme={legacyTheme}>
            <VanityUrlContextProvider siteKey={siteKey}>
                <NotificationProvider notificationContext={{}}>
                    <Component {...dxContext} {...props}/>
                </NotificationProvider>
            </VanityUrlContextProvider>
        </MuiThemeProvider>
    );
};

SiteSettingsSeoWrapper.propTypes = {
    dxContext: PropTypes.object.isRequired,
    component: PropTypes.elementType.isRequired
};
