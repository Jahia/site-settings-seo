import React, {useState} from 'react';
import {Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Radio} from '@material-ui/core';
import {Button, Typography, Check} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import classes from './EditVanityUrlsDialog.scss';
import SiteSettingsSeoCardEntry from './SiteSettingsSeoEntry';

export const EditVanityUrlsDialog = ({
                                         currentLanguage,
                                         nodeData,
                                         isOpen,
                                         onCloseDialog,
                                         wipInfo,
                                         onApply,
                                         languages
                                     }) => {
    const {t} = useTranslation('content-editor');

    const handleCancel = () => {
        onCloseDialog();
    };

    const handleApply = () => {
        onApply({status: statusSelected, languages: selectedLanguages});
    };



    console.log(nodeData.path)
    return (
        <Dialog
            aria-labelledby="alert-dialog-slide-title"
            open={isOpen}
            maxWidth="xl"
            onClose={onCloseDialog}
        >
            <DialogTitle id="dialog-language-title">
                <Typography variant="heading" weight="bold" className={classes.dialogTitle}>
                    {t('content-editor:label.contentEditor.edit.action.workInProgress.dialogTitle')}
                </Typography>
                <Typography className={classes.dialogSubTitle}>
                    {t('content-editor:label.contentEditor.edit.action.workInProgress.dialogSubTitle')}
                    <a
                        className={classes.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={window.contextJsParameters.config.wip}
                    >{t('content-editor:label.contentEditor.edit.action.workInProgress.clickHere')}
                    </a>
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <SiteSettingsSeoCardEntry dxContext={{...window.contextJsParameters}} path={`${nodeData.path}`}/>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button
                    label={t('content-editor:label.contentEditor.edit.action.workInProgress.btnCancel')}
                    onClick={handleCancel}/>
                <Button
                    icon={<Check/>}
                    color="accent"
                    label={t('content-editor:label.contentEditor.edit.action.workInProgress.btnDone')}
                    onClick={handleApply}/>
            </DialogActions>
        </Dialog>
    );
};

EditVanityUrlsDialog.propTypes = {
    currentLanguage: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onCloseDialog: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
    languages: PropTypes.array.isRequired
};

export default EditVanityUrlsDialog;
