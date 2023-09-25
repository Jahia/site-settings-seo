import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import classes from './InfoDialog.scss';
import PropTypes from 'prop-types';
import {Button, Typography} from '@jahia/moonstone';

export const InfoDialog = ({isOpen, message, onCloseDialog}) => {
    const {t} = useTranslation('site-settings-seo');

    return (
        <Dialog
            open={isOpen}
            classes={{root: classes.dialogRoot}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            onClose={onCloseDialog}
        >
            <DialogTitle id="alert-dialog-title">
                <Typography variant="heading" weight="bold" className={classes.dialogTitle}>
                    {t('label.importantInfo')}
                </Typography>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <div className={classes.container} id="alert-dialog-description">
                    <Typography className={classes.label}>
                        {message}
                    </Typography>
                </div>
            </DialogContent>
            <DialogActions className={classes.dialogActionsContainer}>
                <Button autoFocus color="secondary" label={t('label.okGotIt')} onClick={onCloseDialog}/>
            </DialogActions>
        </Dialog>
    );
};

InfoDialog.propTypes = {
    isOpen: PropTypes.bool,
    message: PropTypes.string,
    onCloseDialog: PropTypes.func
};
