import React from 'react';
import {withNotifications} from '@jahia/react-material';
import * as _ from 'lodash';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    withStyles
} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {Button} from '@jahia/moonstone';

let styles = theme => ({
    dialogActionsContainer: {
        justifyContent: 'flex-end'
    },
    dialogRoot: {
        zIndex: 2010
    }
});

class Publication extends React.Component {
    constructor(props) {
        super(props);
        let {vanityMutationsContext, notificationContext, t} = this.props;

        this.publish = function () {
            vanityMutationsContext.publish(_.map(this.props.urlPairs, 'uuid'));
            props.onClose();
            notificationContext.notify(t('label.notifications.publicationStarted'), ['closeAfter5s']);
        };
    }

    render() {
        const {classes, open, onClose, t} = this.props;
        return (
            <div>
                <Dialog fullWidth
                        open={open}
                        classes={{root: classes.dialogRoot}}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        data-vud-role="dialog"
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
                                data-vud-role="button-cancel"
                                onClick={onClose}/>
                        <Button color="accent"
                                label={t('label.dialogs.publish.publish')}
                                size="big"
                                data-vud-role="button-primary"
                                onClick={() => {
                                    this.publish();
                                }}
                        />
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

Publication = _.flowRight(
    withStyles(styles),
    withVanityMutationContext(),
    withNotifications(),
    withTranslation('site-settings-seo')
)(Publication);

export default Publication;
