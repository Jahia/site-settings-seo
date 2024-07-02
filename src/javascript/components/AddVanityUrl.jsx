import React from 'react';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles
} from '@material-ui/core';
import {LanguageMenu} from './LanguageMenu';
import {withTranslation} from 'react-i18next';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {useNotifications} from '@jahia/react-material';
import * as _ from 'lodash';
import {flowRight as compose} from 'lodash';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';
import {Add, Button} from '@jahia/moonstone';
import {Editable} from './Editable';
import {atLeastOneCanonicalLockedForLang, getRowUrlsFromPath} from '~/components/Utils/Utils';
import {useVanityTableDataUrlContext} from '~/components/VanityUrlTableData';

const styles = theme => ({
    pickerRoot: {
        borderRadius: 'unset',
        border: '1px solid #d5d5d5'
    },
    error: {
        color: theme.palette.error.main
    },
    errorMessage: {
        top: '-1px !important',
        background: 'unset !important'
    },
    root: {
        width: '100%',
        '& error': {},
        '& message': {
            display: 'none'
        },
        '& label': {}
    },
    iconButton: {
        height: 18,
        width: 18,
        position: 'absolute',
        top: 4,
        transform: 'scale(0.75)',
        '&:hover': {
            backgroundColor: 'inherit'
        }
    },
    vanityURLText: {
        lineHeight: '21px',
        maxHeight: '42px',
        overflow: 'hidden',
        position: 'relative',
        wordBreak: 'break-all',
        padding: '3px 6px 1px',
        fontSize: '0.8rem',
        color: '#212121',
        fontFamily: 'Nunito, "Nunito Sans"'
    },
    editableText: {
        '&:hover': {
            boxShadow: 'inset 1px 1px 0 0 #d9d7d7, inset -1px -1px 0 0 #d9d7d7',
            cursor: 'text',
            background: 'white'
        },
        '&:hover:before': {
            background: '#FFF!important'
        },
        '&:hover:after': {
            background: '#FFF!important'
        }
    },
    cancel: {
        color: 'red',
        right: '10px',
        top: '7px'
    },
    editDisabled: {
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
        borderBottom: 'unset',
        '&:hover': {
            backgroundColor: 'inherit'
        }
    },
    cell: {
        borderBottom: 'unset',
        padding: '4px 6px 4px 0px'
    },
    cellFirst: {
        paddingLeft: '6px!important',
        paddingRight: '4px!'
    },
    cellLast: {
        paddingRight: '6px!important'
    },
    textbox: {
        fontSize: '1.2rem'
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        borderBottom: 'unset'
    },
    actionButton: {
        padding: '13px 10px 10px 10px'
    },
    cellCanonical: {
        minWidth: '150px',
        padding: '4px 6px 4px 24px'
    },
    setCanonical: {
        marginRight: 'unset',
        '& span + span': {
            padding: '4px 0px 0px 0px'
        }
    },
    chooseLanguage: {
        width: '90px',
        '& div div': {
            width: '80px'
        }
    },
    switchBase: {
        width: '38px'
    },
    switchChecked: {
        width: 'inherit'
    }

});

class AddVanityUrlComponent extends React.Component {
    constructor(props) {
        super(props);
        // Get default language for the language selector
        this.defaultLanguage = this.props.lang;

        this.state = {
            rows: this.props.rows,
            mappings: this._resetMap(),
            errors: [],
            showInputField: false
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
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
        let {vanityMutationsContext, notificationContext, path, t, setParentLoading} = this.props;

        // Exit if there is no mapping to save
        if (this.state.mappings.length === 0) {
            this.handleClose(event);
            return;
        }

        let mappings = _.map(_.filter(this.state.mappings, entry => entry.url), entry => {
            delete entry.focus;
            return entry;
        });

        if (this.props.rows.length > 0) {
            const urls = getRowUrlsFromPath(this.props.rows, path);
            const lang = mappings[0].language;

            // Exit if there is a canonical lock for deletion for the current lang
            if (mappings[0].defaultMapping && atLeastOneCanonicalLockedForLang(urls, lang)) {
                const url = mappings[0].url;
                const message = t('label.errors.CanonicalMappingError_message', {urlMapping: url});
                const label = t('label.errors.CanonicalMappingError');
                this.setState({
                    errors: _.map([message], error => {
                        return {
                            url: url,
                            message: error,
                            label
                        };
                    })
                });
                return;
            }
        }

        try {
            vanityMutationsContext.add(path, mappings, this.props).then(() => {
                setParentLoading && setParentLoading(true);
                this.handleClose(event);
                notificationContext.notify(t('label.notifications.newMappingCreated'), ['closeAfter5s']);
            }, error => {
                if (error.graphQLErrors && error.graphQLErrors[0].extensions) {
                    this.setState({
                        errors: _.map(error.graphQLErrors[0].extensions, value => {
                            const messageKey = value.existingNodePath ? 'used' : 'notAllowed';
                            const message = t(`label.errors.GqlConstraintViolationException.${messageKey}_message`, {existingNodePath: value.existingNodePath, urlMapping: value.urlMapping});
                            const label = t(`label.errors.GqlConstraintViolationException.${messageKey}`);
                            if (value.errorMessage) {
                                console.error(value.errorMessage);
                            }

                            return {
                                url: value.urlMapping,
                                message,
                                label
                            };
                        })
                    });
                } else {
                    notificationContext.notify(t('label.errors.Error'), ['closeButton', 'noAutomaticClose']);
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
                notificationContext.notify(t('label.errors.' + (e.name ? e.name : 'Error')), ['closeButton', 'noAutomaticClose']);
            }
        }
    };

    handleClose = event => {
        this.setState({
            mappings: this._resetMap(),
            errors: [],
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

    handleDialogEntered = () => {
        this.firstMappingInputRef.focus();
    };

    resetInput = input => {
        console.log('reset input');
        input.value = '';
        input.focus();
    };

    render() {
        const {t, classes, hasWritePermission} = this.props;
        const {errors, mappings} = this.state;

        if (!this.state.showInputField) {
            return (
                <>
                    {this.props.children && this.props.children(this.state.showInputField)}
                    <Button isDisabled={!hasWritePermission}
                            className={classes.addVanityButton}
                            aria-label="add"
                            label={t('label.buttons.addVanity')}
                            icon={<Add/>}
                            onClick={event => {
                                event.stopPropagation();
                                this.setState({showInputField: true});
                            }}/>
                </>
            );
        }

        return (
            <Paper elevation={0} classes={{root: classes.pickerRoot}}>
                <Table>
                    <TableBody>
                        {mappings.map((entry, index) => {
                            let errorForRow = _.find(errors, error => error.url === entry.url || error.url === ('/' + entry.url));
                            return (
                                <TableRow key={index} hover={false} className={classes.row} data-sel-role="new-vanity-url">
                                    <TableCell className={classes.cell + ' ' + classes.cellFirst} width="55px">
                                        <Switch classes={{switchBase: classes.switchBase, checked: classes.switchChecked}}
                                                checked={entry.active}
                                                data-vud-role="active"
                                                onChange={(event, checked) => this.handleFieldChange('active', index, checked)}/>
                                    </TableCell>
                                    <TableCell className={classes.cell} width="100%">
                                        <FormControl className={classes.root}>
                                            <Editable isCreateMode
                                                      onEdit={() => {
                                                }}
                                                      onChange={(value, onSuccess, onError) => {
                                                          if (!value) {
                                                              this.setState({
                                                                  errors: [
                                                                      {
                                                                          url: entry.url,
                                                                          label: t('label.errors.InvalidMappingError'),
                                                                          message: t('label.errors.InvalidMappingError_message', {urlMapping: value})
                                                                      }
                                                                  ]
                                                              });
                                                              onError();
                                                          } else if (/[:*?"<>|%+]/.test(value)) {
                                                              this.setState({
                                                                  errors: [
                                                                      {
                                                                          url: entry.url,
                                                                          label: t('label.errors.GqlConstraintViolationException.notAllowedChars'),
                                                                          message: t('label.errors.GqlConstraintViolationException.notAllowed_message', {urlMapping: value})
                                                                      }
                                                                  ]
                                                              });
                                                              onError();
                                                          } else if (value.endsWith('.do')) {
                                                              this.setState({
                                                                  errors: [
                                                                      {
                                                                          url: entry.url,
                                                                          label: t('label.errors.GqlConstraintViolationException.notAllowedDotDo'),
                                                                          message: t('label.errors.GqlConstraintViolationException.notAllowed_message', {urlMapping: value})
                                                                      }
                                                                  ]
                                                              });
                                                              onError();
                                                          } else {
                                                              this.handleFieldChange('url', index, value ? value.trim() : '');
                                                              onSuccess();
                                                          }
                                                      }}/>
                                            {errorForRow && <FormHelperText className={classes.errorMessage}>
                                                <error><label>{errorForRow.label}</label>
                                                    <message>{errorForRow.message}</message>
                                                </error>
                                            </FormHelperText>}
                                        </FormControl>

                                    </TableCell>
                                    <TableCell className={classes.cell + ' ' + classes.chooseLanguage} data-vud-role="language" width="90px">
                                        <LanguageMenu
                                                      languageCode={entry.language}
                                                      onLanguageSelected={languageCode => this.handleFieldChange('language', index, languageCode)}/>
                                    </TableCell>
                                    <TableCell className={classes.cell + ' ' + classes.cellCanonical}>
                                        <FormControlLabel control={<Checkbox checked={entry.defaultMapping}
                                                                             data-vud-role="default"
                                                                             onChange={(event, checked) => this.handleFieldChange('defaultMapping', index, checked)}/>}
                                                          label={t('label.actions.canonical.set')}
                                                          className={classes.setCanonical}/>
                                    </TableCell>
                                    <TableCell className={classes.cell + ' ' + classes.cellLast + ' ' + classes.buttonContainer}>
                                        <div className={classes.actionButton}>
                                            <Button color="default"
                                                    variant="ghost"
                                                    data-vud-role="button-cancel"
                                                    label={t('label.cancel')}
                                                    onClick={this.handleClose}/>
                                        </div>
                                        <div className={classes.actionButton}>
                                            <Button color="accent"
                                                    data-vud-role="button-primary"
                                                    isDisabled={Boolean(errorForRow)}
                                                    label={t('label.dialogs.add.save')}
                                                    onClick={this.handleSave}/>
                                        </div>
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

AddVanityUrlComponent = compose(
    withVanityMutationContext(),
    withStyles(styles),
    withTranslation('site-settings-seo')
)(AddVanityUrlComponent);

const AddVanityUrl = props => {
    const {rows} = useVanityTableDataUrlContext();
    const notificationContext = useNotifications();
    return (<AddVanityUrlComponent rows={rows} notificationContext={notificationContext} {...props}/>);
};

export default AddVanityUrl;
