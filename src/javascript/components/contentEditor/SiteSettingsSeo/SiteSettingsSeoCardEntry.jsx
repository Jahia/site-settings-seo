import React from 'react';
import {SiteSettingsSeoWrapper} from '../../SiteSettingsSeoWrapper';
import {EditVanityUrlsDialog} from '../EditvanityUrlsDialog/EditVanityUrlsDialog';

export const SiteSettingsSeoCardEntry = props => {
    return (<SiteSettingsSeoWrapper component={EditVanityUrlsDialog} dxContext={{...window.contextJsParameters}} {...props}/>);
};
