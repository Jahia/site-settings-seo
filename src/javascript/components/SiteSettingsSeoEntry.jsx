import React from 'react';
import {SiteSettingsSeoComponent} from './SiteSettingsSeoApp';
import SiteSettingsSeoWrapper from './SiteSettingsSeoWrapper';

export const SiteSettingsSeoEntry = props => {
    return (<SiteSettingsSeoWrapper component={SiteSettingsSeoComponent} {...props}/>);
};
