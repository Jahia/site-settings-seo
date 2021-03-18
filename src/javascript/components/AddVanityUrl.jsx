import React from 'react';
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
    IconButton,
    Input,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles
} from '@material-ui/core';
import {Cancel, Star, StarBorder} from '@material-ui/icons';
import {LanguageMenu} from './LanguageMenu';
import {withTranslation} from 'react-i18next';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {withNotifications} from '@jahia/react-material';
import * as _ from 'lodash';
import {SiteSettingsSeoConstants} from './SiteSettingsSeo';
import {flowRight as compose} from 'lodash';

const styles = theme => ({
    pickerRoot: {
        overflowY: 'scroll',
        boxShadow: '1px 1px 2px 0px rgba(0, 0, 0, 0.09)',
        borderRadius: '0px',
        border: '1px solid #d5d5d5',
        borderBottom: 'none',
        '& $PickerViewMaterial': {
            color: 'pink'
        }
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200
    },
    inactive: {
        color: theme.palette.text.disabled
    },
    error: {
        color: theme.palette.error.main
    },
    leftControl: {
        marginRight: 'auto',
        paddingLeft: '16px'
    },
    rowDisabled: {
        backgroundColor: '#f5f5f5',
        color: theme.palette.getContrastText(theme.palette.background.global),

        '& $editDisabled > div': {
            boxShadow: 'none'
        }
    },
    rowEnabled: {
        backgroundColor: '#FFF!important',
        background: 'red',
        '&:hover': {
            backgroundColor: '#FFF!important'
        }
    },
    root: {
        width: '100%',
        '& error': {},
        '& message': {
            display: 'none'
        },
        '& label': {}
    },
    button: {
        height: 18,
        width: 18,
        position: 'absolute',
        top: 4,
        transform: 'scale(0.75)',
        '&:hover': {
            backgroundColor: 'inherit'
        }
    },
    cancel: {
        color: 'red',
        right: '10px',
        top: '7px'
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
    vanitySwitchContainer: {
        width: '60px'
    },
    languageContainer: {
        width: '70px'
    },
    defaultContainer: {
        width: '50px'
    },
    editDisabled: {
        background: 'red',

        '& input': {}
    }
});

class AddVanityUrl extends React.Component {
    constructor(props) {
        super(props);
        // Get default language for the language selector
        this.defaultLanguage = this.props.lang;

        this.state = {
            mappings: this._resetMap(),
            errors: [],
            doPublish: false
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handlePublishCheckboxChange = this.handlePublishCheckboxChange.bind(this);
        this.handleDialogEntered = this.handleDialogEntered.bind(this);
        this.resetInput = this.resetInput.bind(this);
    }

    _resetMap = () => {
        let mapping = [];
        for (let i = SiteSettingsSeoConstants.NB_NEW_MAPPING_ROWS; i >= 0; i--) {
            mapping.push({language: this.defaultLanguage, defaultMapping: false, active: true, focus: false});
        }

        return mapping;
    };

    handleSave = event => {
        let {vanityMutationsContext, notificationContext, path, t} = this.props;

        // Exit if there is no mapping to save
        if (this.state.mappings.length === 0) {
            this.handleClose(event);
            return;
        }

        let mappings = _.map(_.filter(this.state.mappings, entry => entry.url), entry => {
            delete entry.focus;
            return entry;
        });

        try {
            vanityMutationsContext.add(path, mappings, this.props).then(result => {
                if (this.state.doPublish) {
                    vanityMutationsContext.publish(result.data.jcr.modifiedNodes.map(entry => entry.uuid)).then(result => {
                        this.handleClose(event);
                        notificationContext.notify(t('label.notifications.newMappingCreatedAndPublished'));
                    }, error => {
                        notificationContext.notify(t('label.errors.Error'));
                        console.log(error);
                    });
                } else {
                    this.handleClose(event);
                    notificationContext.notify(t('label.notifications.newMappingCreated'));
                }
            }, error => {
                if (error.graphQLErrors && error.graphQLErrors[0].extensions) {
                    this.setState({
                        errors: _.map(error.graphQLErrors[0].extensions, value => {
                            return {
                                url: value.urlMapping,
                                message: t('label.errors.GqlConstraintViolationException_message', {existingNodePath: value.existingNodePath}),
                                label: t('label.errors.GqlConstraintViolationException')
                            };
                        })
                    });
                } else {
                    notificationContext.notify(t('label.errors.Error'));
                    console.log(error);
                }
            });
        } catch (e) {
            if (e.errors) {
                this.setState({
                    errors: _.map(e.errors, error => {
                        return {
                            url: error.mapping,
                            message: t('label.errors.' + error.name + '_message'),
                            label: t('label.errors.' + error.name)
                        };
                    })
                });
            } else {
                notificationContext.notify(t('label.errors.' + (e.name ? e.name : 'Error')));
            }
        }
    };

    handleClose = event => {
        this.setState({
            mappings: this._resetMap(),
            errors: [],
            doPublish: false
        });
        this.props.onClose(event);
    };

    handleFieldChange = (field, index, value) => {
        this.setState(function (previous) {
            if ((field === 'url')) {
                previous.errors = _.pullAllBy(previous.errors, [{url: previous.mappings[index].url}], 'url');
            }

            let mappingToDisableDefaultFlag;
            if ((field === 'defaultMapping' && value === true)) {
                mappingToDisableDefaultFlag = _.find(previous.mappings, mapping => (mapping.defaultMapping && mapping.language === previous.mappings[index].language));
            }

            if ((field === 'language' && previous.mappings[index].defaultMapping)) {
                mappingToDisableDefaultFlag = _.find(previous.mappings, mapping => (mapping.defaultMapping && mapping.language === value)) ? previous.mappings[index] : undefined;
            }

            if (mappingToDisableDefaultFlag) {
                mappingToDisableDefaultFlag.defaultMapping = false;
            }

            previous.mappings[index][field] = value;
            if (field === 'url' && _.filter(previous.mappings, entry => entry.url).length === previous.mappings.length) {
                previous.mappings.push({
                    language: this.defaultLanguage,
                    defaultMapping: false,
                    active: true,
                    focus: false
                });
            }

            return {mappings: previous.mappings, errors: previous.errors};
        });
    };

    handlePublishCheckboxChange = checked => {
        this.setState({
            doPublish: checked
        });
    };

    handleDialogEntered = () => {
        this.firstMappingInputRef.focus();
    };

    inputTab = [];

    resetInput = input => {
        console.log('reset input');
        input.value = '';
        input.focus();
    }

    render() {
        let {t, open, path, onClose, availableLanguages, classes} = this.props;
        const {errors, mappings} = this.state;

        return (
            <div>
                <Dialog fullWidth
                        open={open}
                        maxWidth="md"
                        onClose={onClose}
                        onEntered={this.handleDialogEntered}
                >
                    <DialogTitle id="alert-dialog-title">{t('label.dialogs.add.title')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {path}
                        </DialogContentText>
                    </DialogContent>
                    <DialogContent>
                        <Paper elevation={2} classes={{root: classes.pickerRoot}}>
                            <Table>
                                <TableBody>
                                    {mappings.map((entry, index) => {
                                        let errorForRow = _.find(errors, error => error.url === entry.url || error.url === ('/' + entry.url));
                                        let lineEnabled = Boolean(entry.url) || entry.focus;
                                        return (
                                            <TableRow key={index}
                                                      classes={{
                                                root: (lineEnabled ? classes.rowEnabled : classes.rowDisabled)
                                            }}
                                            >
                                                <TableCell padding="none" className={classes.vanitySwitchContainer}>
                                                    <Switch
                                                        checked={entry.active}
                                                        data-vud-role="active"
                                                        onChange={(event, checked) => this.handleFieldChange('active', index, checked)}/>
                                                </TableCell>
                                                <TableCell padding="none">

                                                    <FormControl className={classes.root}
                                                                 classes={{
                                                        root: (lineEnabled ? '' : classes.editDisabled)
                                                    }}
                                                    >
                                                        <Input
                                                            ref={index}
                                                            inputRef={input => {
                                                                this.inputTab[index] = input;
                                                                if (index === 0) {
                                                                    this.firstMappingInputRef = input;
                                                                }
                                                            }}
                                                            error={Boolean(errorForRow)}
                                                            placeholder={t('label.dialogs.add.text')}
                                                            data-vud-role="url"
                                                            onFocus={() => this.handleFieldChange('focus', index, true)}
                                                            onBlur={() => this.handleFieldChange('focus', index, false)}
                                                            onChange={event => this.handleFieldChange('url', index, event.target.value)}
                                                        />
                                                        {errorForRow && <FormHelperText>
                                                            <error><label>{errorForRow.label}</label>
                                                                <message>{errorForRow.message}</message>
                                                            </error>
                                                        </FormHelperText>}
                                                        {entry.url &&
                                                        <IconButton disableRipple
                                                                    className={classes.button + ' ' + classes.cancel}
                                                                    component="span"
                                                                    onClick={() => {
                                                            delete entry.url;
                                                            this.resetInput(this.inputTab[index]);
                                                        }}
                                                        >
                                                            <Cancel/>
                                                        </IconButton>}
                                                    </FormControl>

                                                </TableCell>
                                                <TableCell padding="none" className={classes.defaultContainer}>
                                                    <Checkbox checked={entry.defaultMapping}
                                                              icon={<StarBorder/>}
                                                              checkedIcon={<Star/>}
                                                              data-vud-role="default"
                                                              onChange={(event, checked) => this.handleFieldChange('defaultMapping', index, checked)}/>
                                                </TableCell>
                                                <TableCell padding="none"
                                                           data-vud-role="language"
                                                           className={classes.languageContainer}
                                                >
                                                    <LanguageMenu languages={availableLanguages}
                                                                  languageCode={entry.language}
                                                                  onLanguageSelected={languageCode => this.handleFieldChange('language', index, languageCode)}/>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Paper>
                    </DialogContent>
                    <DialogActions>
                        <FormControlLabel classes={{root: classes.leftControl}}
                                          control={
                                              <Checkbox
                                                  data-vud-role="checkbox-hint"
                                                  onChange={(event, checked) => this.handlePublishCheckboxChange(checked)}/>
                                          }
                                          label={t('label.dialogs.add.check')}
                        />
                        <div className={classes.dialogActionsButtonContainer}>
                            <Button color="default" data-vud-role="button-cancel" onClick={this.handleClose}>
                                {t('label.cancel')}
                            </Button>
                            <Button autoFocus
                                    color="secondary"
                                    data-vud-role="button-primary"
                                    onClick={this.handleSave}
                            >
                                {t('label.dialogs.add.save')}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

AddVanityUrl = compose(
    withVanityMutationContext(),
    withNotifications(),
    withStyles(styles),
    withTranslation()
)(AddVanityUrl);

export default AddVanityUrl;
