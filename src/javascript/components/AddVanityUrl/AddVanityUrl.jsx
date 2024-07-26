import React, {useState} from 'react';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch
} from '@material-ui/core';
import {LanguageMenu} from '../LanguageMenu';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {Add, Button, Paper} from '@jahia/moonstone';
import {Editable} from '../Editable';
import {
    atLeastOneCanonicalLockedForLang,
    containsInvalidChars,
    getRowUrlsFromPath,
    isBlankUrl,
    isSitesUrl
} from '~/components/Utils/Utils';
import {useVanityTableDataUrlContext} from '~/components/VanityUrlTableData';
import * as PropTypes from 'prop-types';
import classes from './AddVanityUrl.scss';
import {VanityUrlsByPath} from '~/components/gqlQueries';
import {AddVanityMutation} from '~/components/gqlMutations';
import {useApolloClient} from '@apollo/client';
import clsx from 'clsx';

export const AddVanityUrl = ({
    lang,
    path,
    setParentLoading,
    children,
    hasWritePermission,
    selectedLanguageCodes,
    filterText
}) => {
    const {rows, refetch} = useVanityTableDataUrlContext();
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');
    const client = useApolloClient();

    const _resetMapping = () => {
        return {language: lang, defaultMapping: false, active: true, focus: false};
    };

    const [mapping, setMapping] = useState(_resetMapping());
    const [errors, setErrors] = useState([]);
    const [showInputField, setShowInputField] = useState(false);

    const getError = (url, errorName) => {
        return {
            url: url,
            message: t('label.errors.' + errorName + '_message'),
            label: t('label.errors.' + errorName)
        };
    };

    const add = (path, lang, vanityUrl, client) => {
        let errors = [];
        if (isBlankUrl(vanityUrl.url)) {
            errors.push(getError(vanityUrl.url, 'InvalidMappingError'));
        }

        if (isSitesUrl(vanityUrl.url)) {
            errors.push(getError(vanityUrl.url, 'SitesMappingError'));
        }

        if (containsInvalidChars(vanityUrl.url)) {
            errors.push(getError(vanityUrl.url, 'InvalidCharError'));
        }

        if (errors.length > 0) {
            setErrors(errors);
            return;
        }

        return client.mutate({
            mutation: AddVanityMutation,
            variables: {
                vanityUrls: [vanityUrl],
                path: path,
                lang: lang
            }
        }).then(() => refetch());
    };

    const handleSave = () => {
        const mappingToSave = {...mapping};
        delete mappingToSave.focus;

        if (rows.length > 0) {
            const urls = getRowUrlsFromPath(rows, path);
            const lang = mappingToSave.language;

            // Exit if there is a canonical lock for deletion for the current lang
            if (mappingToSave.defaultMapping && atLeastOneCanonicalLockedForLang(urls, lang)) {
                const url = mappingToSave.url;
                const message = t('label.errors.CanonicalMappingError_message', {urlMapping: url});
                const label = t('label.errors.CanonicalMappingError');
                setErrors([{
                    url: url,
                    message: message,
                    label
                }]);
                return;
            }
        }

        add(path, lang, mappingToSave, client).then(() => {
            if (setParentLoading) {
                setParentLoading(true);
            }

            handleClose();
            notificationContext.notify(t('label.notifications.newMappingCreated'), ['closeAfter5s']);
        }, error => {
            if (error.graphQLErrors && error.graphQLErrors[0].extensions) {
                const value = error.graphQLErrors[0].extensions[mapping.url];
                const messageKey = value.existingNodePath ? 'used' : 'notAllowed';
                if (value.errorMessage) {
                    console.error(value.errorMessage);
                }

                setErrors([{
                    url: value.urlMapping,
                    message: t(`label.errors.GqlConstraintViolationException.${messageKey}_message`, {
                        existingNodePath: value.existingNodePath,
                        urlMapping: value.urlMapping
                    }),
                    label: t(`label.errors.GqlConstraintViolationException.${messageKey}`)
                }]);
            } else {
                notificationContext.notify(t('label.errors.Error'), ['closeButton', 'noAutomaticClose']);
                console.log(error);
            }
        });
    };

    const handleClose = () => {
        setMapping(_resetMapping());
        setErrors([]);
        setShowInputField(false);
    };

    const handleFieldChange = (field, value) => {
        if (field === 'url') {
            setErrors([]);
        }

        const previousMapping = {...mapping};

        previousMapping[field] = value;

        setMapping(previousMapping);
    };

    if (!showInputField) {
        return (
            <>
                {children && children(showInputField)}
                <Button isDisabled={!hasWritePermission}
                        className={classes.addVanityButton}
                        aria-label="add"
                        label={t('label.buttons.addVanity')}
                        icon={<Add/>}
                        onClick={event => {
                            event.stopPropagation();
                            setShowInputField(true);
                        }}/>
            </>
        );
    }

    let errorForRow = errors?.find(error => error.url === mapping.url || error.url === ('/' + mapping.url));
    return (
        <Paper className={classes.pickerRoot}>
            <div className={classes.row}
                 data-sel-role="new-vanity-url"
            >
                <div className={clsx(classes.cell, classes.cellFirst)}>
                    <Switch
                        classes={{switchBase: classes.switchBase, checked: classes.switchChecked}}
                        checked={mapping.active}
                        data-vud-role="active"
                        onChange={(event, checked) => handleFieldChange('active', checked)}/>
                </div>
                <div className={clsx(classes.cell, classes.cellForm)}>
                    <FormControl className={classes.root}>
                        <Editable isCreateMode
                                  onEdit={() => {
                                  }}
                                  onChange={(value, onSuccess, onError) => {
                                      if (!value) {
                                          setErrors([
                                              {
                                                  url: mapping.url,
                                                  label: t('label.errors.InvalidMappingError'),
                                                  message: t('label.errors.InvalidMappingError_message')
                                              }
                                          ]);
                                          onError();
                                      } else if (/[:*?"<>|%+]/.test(value)) {
                                          setErrors([
                                              {
                                                  url: mapping.url,
                                                  label: t('label.errors.GqlConstraintViolationException.notAllowedChars'),
                                                  message: t('label.errors.GqlConstraintViolationException.notAllowed_message', {urlMapping: value})
                                              }
                                          ]);
                                          onError();
                                      } else if (value.endsWith('.do')) {
                                          setErrors([
                                              {
                                                  url: mapping.url,
                                                  label: t('label.errors.GqlConstraintViolationException.notAllowedDotDo'),
                                                  message: t('label.errors.GqlConstraintViolationException.notAllowed_message', {urlMapping: value})
                                              }
                                          ]);
                                          onError();
                                      } else {
                                          handleFieldChange('url', value ? value.trim() : '');
                                          onSuccess();
                                      }
                                  }}/>
                        {errorForRow &&
                            <FormHelperText className={classes.errorMessage}>
                                <error>
                                    <label>{errorForRow.label}</label>
                                    <message>{errorForRow.message}</message>
                                </error>
                            </FormHelperText>}
                    </FormControl>

                </div>
                <div className={clsx(classes.cell, classes.chooseLanguage)}
                     data-vud-role="language"
                >
                    <LanguageMenu
                        languageCode={mapping.language}
                        onLanguageSelected={languageCode => handleFieldChange('language', languageCode)}/>
                </div>
                <div className={clsx(classes.cell, classes.cellCanonical)}>
                    <FormControlLabel control={<Checkbox checked={mapping.defaultMapping}
                                                         data-vud-role="default"
                                                         onChange={(event, checked) => handleFieldChange('defaultMapping', checked)}/>}
                                      label={t('label.actions.canonical.set')}
                                      className={classes.setCanonical}/>
                </div>
                <div className={clsx(classes.cell, classes.cellLast, classes.buttonContainer)}>
                    <div className={classes.actionButton}>
                        <Button color="default"
                                variant="ghost"
                                data-vud-role="button-cancel"
                                label={t('label.cancel')}
                                onClick={handleClose}/>
                    </div>
                    <div className={classes.actionButton}>
                        <Button color="accent"
                                data-vud-role="button-primary"
                                isDisabled={Boolean(errorForRow)}
                                label={t('label.dialogs.add.save')}
                                onClick={handleSave}/>
                    </div>
                </div>
            </div>
        </Paper>
    );
};

AddVanityUrl.propTypes = {
    lang: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    children: PropTypes.object,
    hasWritePermission: PropTypes.bool.isRequired,
    setParentLoading: PropTypes.func,
    selectedLanguageCodes: PropTypes.array,
    filterText: PropTypes.string
};

