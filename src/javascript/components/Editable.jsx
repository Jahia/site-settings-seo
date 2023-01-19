import React, {useState} from 'react';
import {FormControl, FormHelperText} from '@material-ui/core';
import classes from './Editable.scss';
import {Input, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';

export const Editable = React.memo(({value, onChange, isCreateMode}) => {
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorLabel, setErrorLabel] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const {t} = useTranslation('site-settings-seo');

    const save = () => {
        if (onChange.length === 1) {
            onChange(currentValue);
            setEdit(false);
        } else {
            setLoading(true);
            onChange(currentValue,
                () => {
                    setLoading(false);
                    setEdit(false);
                    setErrorLabel(null);
                    setErrorMessage(null);
                },
                (label, message) => {
                    setLoading(false);
                    setEdit(true);
                    setErrorLabel(label);
                    setErrorMessage(message);
                }
            );
        }
    };

    const onValueChange = event => {
        setCurrentValue(event.target.value.trim());
        setErrorLabel(null);
        setErrorMessage(null);
    };

    if (!edit && !isCreateMode) {
        return (
            <div onClick={event => {
                setEdit(true);
                event.stopPropagation();
            }}
            >
                <Typography data-vud-role="url"
                            className={clsx(
                                classes.vanityURLText,
                                classes.editableText
                            )}
                >
                    {currentValue}
                </Typography>
            </div>
        );
    }

    return (
        <>
            <FormControl className={classes.root}>
                <Input focusOnField
                       value={currentValue}
                       placeholder={t('label.dialogs.add.text')}
                       disabled={loading}
                       classes={classes.textInput}
                       onChange={onValueChange}
                       onClick={e => {
                           e.stopPropagation();
                       }}
                       onBlur={save}
                       onKeyUp={e => {
                           if (e.key === 'Enter') {
                               save();
                           } else if (e.key === 'Escape') {
                               currentValue(value);
                           }
                       }}/>
                {errorLabel &&
                    <FormHelperText className={classes.errorMessage}>
                        <error><label>{errorLabel}</label>
                            <message>{errorMessage}</message>
                        </error>
                    </FormHelperText>}
            </FormControl>
        </>
    );
});

Editable.propTypes = {
    isCreateMode: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func
};
