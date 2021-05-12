import React from 'react';
import {SiteSettingsSeoComponent, SiteSettingsSeoConstants} from './SiteSettingsSeoApp';
import SiteSettingsSeoWrapper from './SiteSettingsSeoWrapper';

const SiteSettingsSeoEntry = props => <SiteSettingsSeoWrapper component={SiteSettingsSeoComponent} {...props}/>;

export {SiteSettingsSeoEntry, SiteSettingsSeoConstants};
