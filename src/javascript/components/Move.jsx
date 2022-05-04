import React, {useState, useRef} from 'react';
import * as _ from 'lodash';
import {
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
import {useTranslation, withTranslation} from 'react-i18next';
import {Picker} from '@jahia/data-helper';
import {PickerViewMaterial, withNotifications} from '@jahia/react-material';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {GetNodeQuery} from './gqlQueries';
import {Query, useQuery} from 'react-apollo';
import gql from 'graphql-tag';
import {Button, Checkbox} from "@jahia/moonstone";

let styles = () => ({
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
    },
    checkbox: {
        margin: '8px'
    }
});

const MoveCmp = (props) => {
    const {classes, lang, path, urlPairs, vanityMutationsContext, notificationContext, open, onClose} = props;
    const {t} = useTranslation('site-settings-seo');
    const [targetPath, setTargetPath] = useState('');
    const [saveDisabled, setSaveDisabled] = useState(true);
    const picker = useRef();
    const selectableTypes = ['jmix:mainResource', 'jnt:page'];

    const handleMove = () => {
        try {
            vanityMutationsContext.move(_.map(urlPairs, 'uuid'), targetPath, props)
                .then(() => {
                    handleClose();
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

    const handleSaveDisabled = () => {
        setSaveDisabled(previous => !previous);
    }

    const handleTargetPathChange = (event) => {
        setTargetPath(event.target.value);
    }

    const handleClose = () => {
        setTargetPath('');
        setSaveDisabled(true);
        onClose();
    }

    const {loading, error, data} = useQuery(GetNodeQuery, {
        fetchPolicy: "network-only",
        errorPolicy: "all",
        variables: {path: targetPath, types: selectableTypes}
    });

    if (!loading && !error && data && data.jcr && data.jcr.nodeByPath.inPicker) {
        setTimeout(() => {
            picker.current.openPaths(data.jcr.nodeByPath.path.substr(0, data.jcr.nodeByPath.path.lastIndexOf('/')));
        });
    }

    return (
        <div>
            <Dialog
                open={open}
                classes={{root: classes.dialogRoot}}
                aria-labelledby="form-dialog-title"
                data-vud-role="dialog"
                onClose={handleClose}
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
                            value={targetPath}
                            onChange={handleTargetPathChange}
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
                        <Picker ref={picker}
                                fragments={['displayName', {
                                    applyFor: 'node',
                                    gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
                                }]}
                                rootPaths={[path]}
                                defaultOpenPaths={[path]}
                                openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText', 'jmix:droppableContent', 'jmix:mainResource']}
                                selectableTypes={selectableTypes}
                                queryVariables={{language: lang}}
                                selectedPaths={!loading && !error && data.jcr && data.jcr.nodeByPath.inPicker ? [data.jcr.nodeByPath.path] : []}
                                onSelectItem={setTargetPath}
                        >
                            {({loading, ...others}) => (
                                <PickerViewMaterial {...others}
                                                    textRenderer={entry => entry.node.displayName}/>
                            )}
                        </Picker>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <FormControlLabel
                        control={
                            <Checkbox className={classes.checkbox}
                                      checked={!saveDisabled}
                                      data-vud-role="checkbox-hint"
                                      onChange={handleSaveDisabled}/>
                        }
                        label={t('label.dialogs.move.confirm')}
                    />
                    <div className="flexFluid"/>
                    <Button color="default"
                            size="big"
                            label={t('label.cancel')}
                            data-vud-role="button-cancel"
                            onClick={handleClose}/>
                    <Button color="accent"
                            size="big"
                            label={t('label.dialogs.move.move')}
                            disabled={saveDisabled || targetPath.length === 0 || Boolean(error)}
                            data-vud-role="button-primary"
                            onClick={handleMove}
                    />
                </DialogActions>
            </Dialog>
        </div>
    );
}

const Move = _.flowRight(
    withStyles(styles),
    withVanityMutationContext(),
    withNotifications(),
)(MoveCmp);

export default Move;
