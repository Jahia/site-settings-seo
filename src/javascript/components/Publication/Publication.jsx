import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {Button} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import classes from './Publication.scss';
import {useApolloClient} from '@apollo/client';
import {PublishMutation} from '~/components/gqlMutations';

export const Publication = ({isOpen, urlPairs, onClose}) => {
    const {t} = useTranslation('site-settings-seo');

    const client = useApolloClient();
    const publish = () => {
        client.mutate({
            mutation: PublishMutation,
            variables: {pathsOrIds: urlPairs.map(urlPair => urlPair.uuid)}
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
                    data-sel-role="publication-validation-dialog"
                    onClose={onClose}
            >
                <DialogTitle id="alert-dialog-title">{t('label.dialogs.publish.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('label.dialogs.publish.content')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions className={classes.dialogActionsContainer}>
                    <Button color="default"
                            label={t('label.cancel')}
                            size="big"
                            data-sel-role="cancel"
                            onClick={onClose}/>
                    <Button color="accent"
                            label={t('label.dialogs.publish.publish')}
                            size="big"
                            data-sel-role="publish"
                            onClick={() => {
                                publish();
                            }}
                    />
                </DialogActions>
            </Dialog>
        </div>
    );
};

Publication.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    urlPairs: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired
};

