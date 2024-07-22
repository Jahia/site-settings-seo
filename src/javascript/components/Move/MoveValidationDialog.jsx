import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {Button, Typography} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import classes from './MoveValidationDialog.scss';
import {useApolloClient} from '@apollo/client';
import {MoveMutation} from '~/components/gqlMutations';

export const MoveValidationDialog = ({isOpen, targetPath, urlPairs, onClose}) => {
    const {t} = useTranslation('site-settings-seo');

    const client = useApolloClient();
    const move = () => {
        client.mutate({
            mutation: MoveMutation,
            variables: {pathsOrIds: urlPairs.map(urlPair => urlPair.uuid), target: targetPath}
        });
        onClose();
    };

    return (
        <div>
            <Dialog fullWidth
                    open={isOpen}
                    classes={{root: classes.dialogRoot}}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    data-sel-role="move-validation-dialog"
                    onClose={onClose}
            >
                <DialogTitle id="alert-dialog-title">{t('label.dialogs.move.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography>
                            {t('label.dialogs.move.contentStart')}

                        </Typography>
                        {urlPairs.map(urlPair => {
                            return (
                                <Typography key={urlPair.uuid}>
                                    {
                                        t('label.dialogs.move.vanityDetails', {
                                            path: urlPair.default.url,
                                            source: urlPair.default.targetNode.path
                                        })
                                    }
                                </Typography>
                            );
                        })}
                        <Typography>
                            {t('label.dialogs.move.contentTo', {
                                targetPath: targetPath
                            })}
                        </Typography>
                        <Typography>
                            {t('label.dialogs.move.warningMessage', {targetPath: targetPath})}
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions className={classes.dialogActionsContainer}>
                    <Button color="default"
                            label={t('label.cancel')}
                            size="big"
                            data-sel-role="cancel"
                            onClick={onClose}/>
                    <Button color="accent"
                            label={t('label.dialogs.move.move')}
                            size="big"
                            data-sel-role="move"
                            onClick={() => {
                                move();
                            }}
                    />
                </DialogActions>
            </Dialog>
        </div>
    );
};

MoveValidationDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    targetPath: PropTypes.string.isRequired,
    urlPairs: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired
};

