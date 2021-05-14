import React from 'react';
import * as _ from 'lodash';
import {Button, Checkbox, FormControlLabel, withStyles, Table, TableBody, TableRow, TableCell, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {flowRight as compose} from 'lodash';
import {withTranslation} from 'react-i18next';
import {withNotifications} from '@jahia/react-material';
import {withVanityMutationContext} from './VanityMutationsProvider';

let styles = theme => ({
    dialogNote: {
        fontSize: '0.875rem',
        marginTop: '10px'
    },
    vanityUrlTable: {
        border: '1px solid #d5d5d5',
        borderBottom: 'none',
        boxShadow: '1px 1px 2px 0px rgba(0, 0, 0, 0.09)'
    },
    dialogActionsButtonContainer: {
        display: 'inline-block',
        verticalAlign: 'middle',
        position: 'absolute',
        right: '20px',
        paddingTop: '7px'
    },
    vanityUrlTableCellLanguage: {
        color: '#676767',
        fontSize: '0.875rem',
        fontWeight: '400',
        width: '50px',
        padding: '0 15px'
    },
    vanityUrlTableCellUrl: {
        fontSize: '0.875rem',
        fontWeight: '400',
        padding: '0 15px',
        wordBreak: 'break-all'
    },
    dialogRoot: {
        zIndex: 2010
    }
});

class Deletion extends React.Component {
    constructor(props) {
        super(props);

        let {vanityMutationsContext, notificationContext, t} = this.props;
        this.delete = function () {
            vanityMutationsContext.delete(_.map(this.props.urlPairs, 'uuid'), this.props);
            props.onClose();
            notificationContext.notify(t('label.notifications.deletionConfirmed'));
        };

        this.state = {
            deleteDisabled: true
        };
        this.handleDeleteDisabled = this.handleDeleteDisabled.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleDeleteDisabled() {
        this.setState(previous => ({deleteDisabled: !previous.deleteDisabled}));
    }

    handleClose() {
        this.setState({
            deleteDisabled: true
        });
        this.props.onClose();
    }

    render() {
        const {open, classes, onClose, t, urlPairs} = this.props;
        let mappingCount = urlPairs.length;
        return (
            <div>
                <Dialog fullWidth
                        classes={{root: classes.dialogRoot}}
                        open={open}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        data-vud-role="dialog"
                        onClose={onClose}
                >
                    <DialogTitle id="alert-dialog-title">{t('label.dialogs.delete.title')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-headline">
                            {t('label.dialogs.delete.headline', {count: mappingCount})}
                        </DialogContentText><br/>

                    </DialogContent>
                    <DialogContent>
                        <Table className={classes.vanityUrlTable}>
                            <TableBody>
                                {urlPairs.map((url, i) => (
                                    <TableRow key={i}>
                                        <TableCell className={classes.vanityUrlTableCellUrl}>{url.default.url}</TableCell>
                                        <TableCell className={classes.vanityUrlTableCellLanguage}>{url.default.language}</TableCell>
                                    </TableRow>
                                  )
                                )}
                            </TableBody>
                        </Table>
                        <DialogContentText className={classes.dialogNote} id="alert-dialog-content">
                            {t('label.dialogs.delete.content')}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <span>
                            <FormControlLabel
        control={
            <Checkbox checked={!this.state.deleteDisabled}
                      data-vud-role="checkbox-hint"
                      onChange={() => this.handleDeleteDisabled()}/>
                                }
        label={t('label.dialogs.delete.terms')}
                            />
                            <div className={classes.dialogActionsButtonContainer}>
                                <Button color="default" data-vud-role="button-cancel" onClick={this.handleClose}>
                                    {t('label.cancel')}
                                </Button>
                                <Button autoFocus
                                        color="secondary"
                                        disabled={this.state.deleteDisabled}
                                        data-vud-role="button-primary"
                                        onClick={() => {
this.delete();
}}
                                >
                                    {t('label.dialogs.delete.delete')}
                                </Button>
                            </div>
                        </span>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

Deletion = compose(
    withStyles(styles),
    withVanityMutationContext(),
    withNotifications(),
    withTranslation('site-settings-seo')
)(Deletion);

export default Deletion;
