import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import classes from './EditVanityUrlsDialog.scss';
import SiteSettingsSeoCardEntry from '../SiteSettingsSeo/SiteSettingsSeoCardEntry';

export const EditVanityUrlsDialog = ({
                                         nodeData,
                                         isOpen,
                                         onCloseDialog
                                     }) => {
    const {t} = useTranslation('site-settings-seo');

    const handleCancel = () => {
        onCloseDialog();
    };

    return (
        <Dialog
            aria-labelledby="alert-dialog-slide-title"
            open={isOpen}
            maxWidth="xl"
            onClose={onCloseDialog}
        >
            <DialogTitle id="dialog-language-title">
                <Typography variant="heading" weight="bold" className={classes.dialogTitle}>
                    {nodeData.displayName}
                </Typography>
                <Typography className={classes.dialogSubTitle}>
                    {nodeData.displayableNode.path}
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <SiteSettingsSeoCardEntry dxContext={{...window.contextJsParameters}} path={`${nodeData.path}`}/>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button
                    size="big"
                    label={t('label.close')}
                    onClick={handleCancel}/>
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
