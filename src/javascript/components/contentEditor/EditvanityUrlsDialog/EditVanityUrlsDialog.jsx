import React from 'react';
import SiteSettingsSeoCard from '../SiteSettingsSeo/SiteSettingsSeoCardApp';
import {Button, Typography} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import classes from './EditVanityUrlsDialog.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {useVanityUrlContext} from '../../Context/VanityUrl.context';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
let ButtonRenderer;
import('@jahia/content-editor').then(v => {
    ButtonRenderer = v.ButtonRenderer;
}).catch(e => console.warn('Error loading ButtonRenderer from content-editor', e));

import {ButtonRenderer as LocalButtonRenderer} from '../../Renderer/getButtonRenderer';

export const EditVanityUrlsDialog = ({
    nodeData,
    isOpen,
    onCloseDialog,
    ...props
}) => {
    const {t} = useTranslation('site-settings-seo');
    const {languages, siteInfo} = useVanityUrlContext();
    return (
        <Dialog
            className={classes.dialogOverflow}
            open={isOpen}
            maxWidth="xl"
            className={classes.dialog}
            open={isOpen}
            onClose={onCloseDialog}
        >
            <div className={classes.header}>
                <DialogTitle id="dialog-language-title" className={classes.titleContainer}>
                    <Typography variant="heading" weight="bold" className={classes.dialogTitle}>
                        {nodeData.displayName}
                    </Typography>
                    <Typography className={classes.dialogSubTitle}>
                        {nodeData.displayableNode.path}
                    </Typography>
                </DialogTitle>
                <DisplayAction actionKey="publishAllVanity" render={ButtonRenderer || LocalButtonRenderer} nodeData={nodeData}/>
            </div>
            <DialogContent className={classes.dialogContent}>
                <SiteSettingsSeoCard path={nodeData.path}
                                     siteInfo={siteInfo}
                                     languages={languages}
                                     {...props}/>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button
                    size="big"
                    label={t('label.close')}
                    onClick={onCloseDialog}/>
            </DialogActions>
        </Dialog>
    );
};

EditVanityUrlsDialog.propTypes = {
    nodeData: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onCloseDialog: PropTypes.func.isRequired
};

export default EditVanityUrlsDialog;
