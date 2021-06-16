import React from 'react';
import * as _ from 'lodash';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Paper,
    TextField,
    withStyles
} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import {Picker} from '@jahia/data-helper';
import {PickerViewMaterial, withNotifications} from '@jahia/react-material';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {GetNodeQuery} from './gqlQueries';
import {Query} from 'react-apollo';
import gql from 'graphql-tag';

let styles = theme => ({
    pickerRoot: {
        minHeight: '330px',
        maxHeight: '350px',
        overflowY: 'scroll',
        boxShadow: '1px 1px 2px 0px rgba(0, 0, 0, 0.09)',
        borderRadius: '0px',
        border: '1px solid #d5d5d5'
    },
    dialogNote: {
        fontSize: '0.875rem',
        marginTop: '10px'
    },
    dialogActionsButtonContainer: {
        display: 'inline-block',
        verticalAlign: 'middle',
        position: 'absolute',
        right: '20px',
        paddingTop: '7px'
    },
    filterPath: {
        marginTop: '20px',
        '& > div': {
            borderRadius: '0px',
            border: '1px solid #d5d5d5',
            borderBottom: 'none',
            boxShadow: 'none',
            background: 'whitesmoke'
        }
    },
    helperContainer: {
        padding: '0',
	    height: 'auto',
	    top: '35px',
	    background: 'transparent'
    },
    helperErrorMessage: {
        top: '10px!important'
    },
    dialogRoot: {
        zIndex: 2010
    }
});

class Move extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            targetPath: '',
            saveDisabled: true
        };

        this.handleMove = this.handleMove.bind(this);
        this.handleSaveDisabled = this.handleSaveDisabled.bind(this);
        this.handleTargetPathChange = this.handleTargetPathChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.picker = React.createRef();
    }

    handleMove() {
        let {vanityMutationsContext, notificationContext, t} = this.props;
        try {
            vanityMutationsContext.move(_.map(this.props.urlPairs, 'uuid'), this.state.targetPath, this.props)
                .then(() => {
                    this.handleClose();
                    notificationContext.notify(t('label.notifications.moveConfirmed'));
                })
                .catch(errors => {
                    if (errors.graphQLErrors) {
                        _.each(errors.graphQLErrors, error => {
                            notificationContext.notify(error.message);
                        });
                    } else {
                        notificationContext.notify(t('label.errors.Error'));
                    }

                    console.log(errors);
                });
        } catch (e) {
            notificationContext.notify(t('label.errors.' + (e.name ? e.name : 'Error')));
        }
    }

    handleSaveDisabled() {
        this.setState(previous => ({saveDisabled: !previous.saveDisabled}));
    }

    handleTargetPathChange(event) {
        this.setState({targetPath: event.target.value});
    }

    handleClose() {
        this.setState({
            targetPath: '',
            saveDisabled: true
        });
        this.props.onClose();
    }

    render() {
        const {t, classes, lang, path} = this.props;
        return (
            <div>
                <Query fetchPolicy="network-only" query={GetNodeQuery} variables={{path: this.state.targetPath}}>
                    {({loading, error, data}) => {
                        if (!loading && !error && data.jcr && data.jcr.nodeByPath.inPicker) {
                            setTimeout(() => {
 this.picker.current.openPaths(data.jcr.nodeByPath.path.substr(0, data.jcr.nodeByPath.path.lastIndexOf('/')));
});
                        }

                        return (
                            <Dialog
                            open={this.props.open}
                            classes={{root: classes.dialogRoot}}
                            aria-labelledby="form-dialog-title"
                            data-vud-role="dialog"
                            onClose={this.handleClose}
                            >
                                <DialogTitle id="form-dialog-title">{t('label.dialogs.move.title')}</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>{t('label.dialogs.move.content')}</DialogContentText>
                                    <FormControl className={classes.formControl}>
                                        <TextField
                                        autoFocus
                                        fullWidth
                                        error={Boolean(error)}
                                        id="targetPath"
                                        type="text"
                                        placeholder="Enter a path"
                                        className={classes.filterPath}
                                        value={this.state.targetPath}
                                        onChange={this.handleTargetPathChange}
                                    />
                                        <FormHelperText className={classes.helperContainer}>{error &&
                                        <error><label>{t('label.errors.MoveInvalidTarget')}</label>
                                            <message
                                            className={classes.helperErrorMessage}
                                            >{t(['label.errors.MoveInvalidTarget_message', 'label.errors.MoveInvalidTarget'])}
                                            </message>
                                        </error>}
                                        </FormHelperText>
                                    </FormControl>
                                    <Paper elevation={4} classes={{root: classes.pickerRoot}}>
                                        <Picker ref={this.picker}
                                                fragments={['displayName', {
                                        applyFor: 'node',
                                        gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
                                    }]}
                                                rootPaths={[path]}
                                                defaultOpenPaths={[path]}
                                                openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText', 'jmix:droppableContent', 'jmix:mainResource']}
                                                selectableTypes={['jnt:page', 'jmix:mainResource']}
                                                queryVariables={{language: lang}}
                                                selectedPaths={!loading && !error && data.jcr && data.jcr.nodeByPath.inPicker ? [data.jcr.nodeByPath.path] : []}
                                                onSelectItem={path => {
                                                this.setState({targetPath: path});
                                            }}
                                        >
                                            {({loading, ...others}) => (
                                                <PickerViewMaterial {...others}
                                                                    textRenderer={entry => entry.node.displayName}/>
)}
                                        </Picker>
                                    </Paper>
                                </DialogContent>
                                <DialogActions>
                                    <span>
                                        <FormControlLabel
                                control={
                                    <Checkbox checked={!this.state.saveDisabled}
                                              data-vud-role="checkbox-hint"
                                              onChange={() => this.handleSaveDisabled()}/>
                                }
                                label={t('label.dialogs.move.confirm')}
                            />

                                        <div className={classes.dialogActionsButtonContainer}>
                                            <Button color="default"
                                                    data-vud-role="button-cancel"
                                                    onClick={this.handleClose}
                                            >{t('label.cancel')}
                                            </Button>
                                            <Button color="secondary"
                                                    disabled={this.state.saveDisabled || this.state.targetPath.length === 0 || Boolean(error)}
                                                    data-vud-role="button-primary"
                                                    onClick={this.handleMove}
                                            >{t('label.dialogs.move.move')}
                                            </Button>
                                        </div>
                                    </span>
                                </DialogActions>
                            </Dialog>
);
                    }}
                </Query>
            </div>
        );
    }
}

Move = _.flowRight(
    withStyles(styles),
    withVanityMutationContext(),
    withNotifications(),
    (withTranslation('site-settings-seo'))
)(Move);

export default Move;
