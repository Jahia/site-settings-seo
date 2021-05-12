import React from 'react';
import {
    Checkbox,
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
import {Cancel} from '@material-ui/icons';
import {LanguageMenu} from './LanguageMenu';
import {withTranslation} from 'react-i18next';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {withNotifications} from '@jahia/react-material';
import * as _ from 'lodash';
import {SiteSettingsSeoConstants} from './SiteSettingsSeoEntry';
import {flowRight as compose} from 'lodash';
import {Add, Button} from '@jahia/moonstone';

const styles = theme => ({
    pickerRoot: {
        borderRadius: '4px',
        border: '1px solid #00A0E3'
    },
    error: {
        color: theme.palette.error.main
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
    editDisabled: {
        background: 'red',

        '& input': {}
    },
    addVanityButton: {
        color: '#575757',
        '&:hover': {
            backgroundColor: 'transparent',
            color: '#4A4343'
        }
    },
    row: {
        '&:hover': {
            backgroundColor: 'inherit'
        }
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
            doPublish: false,
            showInputField: false
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
        for (let i = SiteSettingsSeoConstants.NB_NEW_MAPPING_ROWS; i > 0; i--) {
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
            doPublish: false,
            showInputField: false
        });
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
    };

    render() {
        const {t, availableLanguages, classes} = this.props;
        const {errors, mappings} = this.state;

        if (!this.state.showInputField) {
            return <Button className={classes.addVanityButton}
                           aria-label="add"
                           label={t('label.buttons.addVanity')}
                           icon={<Add/>}
                           onClick={event => {
                               event.stopPropagation();
                               this.setState({showInputField: true});
                           }}/>
        }

        return (
            <Paper elevation={0} classes={{root: classes.pickerRoot}}>
                <Table>
                    <TableBody>
                        {mappings.map((entry, index) => {
                            let errorForRow = _.find(errors, error => error.url === entry.url || error.url === ('/' + entry.url));
                            let lineEnabled = Boolean(entry.url) || entry.focus;
                            return (
                                <TableRow key={index} hover={false} className={classes.row}>
                                    <TableCell width="5%">
                                        <Switch
                                            checked={entry.active}
                                            data-vud-role="active"
                                            onChange={(event, checked) => this.handleFieldChange('active', index, checked)}/>
                                    </TableCell>
                                    <TableCell width="70%">

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
                                                endAdornment={entry.url ?
                                                <IconButton disableRipple
                                                            className={classes.button + ' ' + classes.cancel}
                                                            component="span"
                                                            onClick={() => {
                                                                delete entry.url;
                                                                this.resetInput(this.inputTab[index]);
                                                            }}
                                                >
                                                    <Cancel/>
                                                </IconButton> : null}
                                                onFocus={() => this.handleFieldChange('focus', index, true)}
                                                onBlur={() => this.handleFieldChange('focus', index, false)}
                                                onChange={event => this.handleFieldChange('url', index, event.target.value)}
                                            />
                                            {errorForRow && <FormHelperText>
                                                <error><label>{errorForRow.label}</label>
                                                    <message>{errorForRow.message}</message>
                                                </error>
                                            </FormHelperText>}
                                        </FormControl>

                                    </TableCell>
                                    <TableCell data-vud-role="language" width="9%">
                                        <LanguageMenu languages={availableLanguages}
                                                      languageCode={entry.language}
                                                      onLanguageSelected={languageCode => this.handleFieldChange('language', index, languageCode)}/>
                                    </TableCell>
                                    <TableCell width="10%">
                                        <FormControlLabel control={<Checkbox checked={entry.defaultMapping}
                                                                             data-vud-role="default"
                                                                             onChange={(event, checked) => this.handleFieldChange('defaultMapping', index, checked)}/>}
                                                          label="Set as canonical" />
                                    </TableCell>
                                    <TableCell width="3%">
                                        <Button color="default" variant="ghost" data-vud-role="button-cancel" label={t('label.cancel')} onClick={this.handleClose}/>
                                    </TableCell>
                                    <TableCell width="3%">
                                        <Button color="accent"
                                                data-vud-role="button-primary"
                                                label={t('label.dialogs.add.save')}
                                                onClick={this.handleSave}/>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

AddVanityUrl = compose(
    withVanityMutationContext(),
    withNotifications(),
    withStyles(styles),
    withTranslation('site-settings-seo')
)(AddVanityUrl);

export default AddVanityUrl;
