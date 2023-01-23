import React from 'react';
import SiteSettingsSeoWrapper from '../../SiteSettingsSeoWrapper';
import EditVanityUrlsDialog from '../EditvanityUrlsDialog';

export const SiteSettingsSeoCardEntry = props => {
    return (<SiteSettingsSeoWrapper component={EditVanityUrlsDialog} dxContext={{...window.contextJsParameters}} {...props}/>);
};
