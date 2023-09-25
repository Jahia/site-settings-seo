import React from 'react';
import SiteSettingsSeoCard from '../SiteSettingsSeo/SiteSettingsSeoCardApp';
import {Button, Chip, Typography, Visibility} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import classes from './EditVanityUrlsDialog.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {useVanityUrlContext} from '../../Context/VanityUrl.context';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {ButtonRenderer} from '@jahia/jcontent';
import clsx from 'clsx';

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
            data-sel-role="manage-vanity-url-dialog"
            className={clsx(classes.dialog, classes.dialogOverflow)}
            open={isOpen}
            maxWidth="xl"
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
                {nodeData.hasWritePermission ? <DisplayAction actionKey="publishAllVanity" render={ButtonRenderer} nodeData={nodeData}/> :
                <Chip data-sel-role="read-only-badge"
                      label={t('label.readOnly')}
                      icon={<Visibility/>}
                      color="warning"
                />}
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
