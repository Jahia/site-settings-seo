import React from 'react';
import {SiteSettingsSeoFunctionalComponent} from './SiteSettingsSeoApp';
import SiteSettingsSeoWrapper from './SiteSettingsSeoWrapper';

export const SiteSettingsSeoEntry = props => {
    return (<SiteSettingsSeoWrapper component={SiteSettingsSeoFunctionalComponent} {...props}/>);
};
