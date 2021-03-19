import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    withStyles
} from '@material-ui/core';
import {flowRight as compose} from 'lodash';
import {withTranslation} from 'react-i18next';

let styles = theme => ({
    dialogActionsContainer: {
        justifyContent: 'flex-end'
    }
});

class InfoButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {classes, open, message, onClose, t} = this.props;
        return (
            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                onClose={onClose}
            >

                <DialogTitle id="alert-dialog-title">{t('label.importantInfo')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions className={classes.dialogActionsContainer}>
                    <Button autoFocus color="secondary" onClick={onClose}>
                        {t('label.okGotIt')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

InfoButton = compose(
    withStyles(styles),
    (withTranslation('site-settings-seo'))
)(InfoButton);

export default InfoButton;
