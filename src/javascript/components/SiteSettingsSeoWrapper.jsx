import React from 'react';
import {MuiThemeProvider} from '@material-ui/core';
import {NotificationProvider, legacyTheme} from '@jahia/react-material';
import * as _ from 'lodash';
import {VanityMutationsProvider} from './VanityMutationsProvider';
import {VanityUrlLanguageData} from './VanityUrlLanguageData';
import {withSite} from './SiteConnector';
import {ProgressOverlay} from "@jahia/react-material";

const SiteSettingsSeo = _.flowRight(
    withSite()
)(function (props) {
    if (!props.dxContext.mainResourcePath) {
        return <ProgressOverlay/>;
    }

    const {component : Component, ...otherProps} = props;

    return (
        <MuiThemeProvider theme={legacyTheme}>
            <NotificationProvider notificationContext={{}}>
                <VanityMutationsProvider lang={props.dxContext.lang} vanityMutationsContext={{}}>
                    <VanityUrlLanguageData path={props.dxContext.mainResourcePath}>
                        {languages => <Component languages={languages} {...otherProps}/>}
                    </VanityUrlLanguageData>
                </VanityMutationsProvider>
            </NotificationProvider>
        </MuiThemeProvider>
    );
});

export default SiteSettingsSeo;
