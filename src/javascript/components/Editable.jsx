import React, {useRef, useState} from 'react';
import {FormControl, FormHelperText} from '@material-ui/core';
import classes from './Editable.scss';
import {Input} from '@jahia/moonstone';
import {trimUrl} from './utils';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';

export const Editable = React.memo(({onChange, onEdit, isCreateMode, render: Render, ...props}) => {
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorLabel, setErrorLabel] = useState(null);
    const [errorMessage, setErrorMessage] = useState(false);
    const [value, setValue] = useState(props.value);
    const {t} = useTranslation('site-settings-seo');

    const save = () => {
        if (onChange.length === 1) {
            onChange(value);
            setEdit(false);
        } else {
            setLoading(true);
            onChange(value,
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
        setValue(trimUrl(event.target.value));
        setErrorLabel(null);
        setErrorMessage(null);
    };

    return (
        <> {edit || isCreateMode ?
            <FormControl className={classes.root}>
                <Input focusOnField
                       value={value}
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
                           setValue(props.value);
                       }
                   }}/>
                {errorLabel && <FormHelperText className={classes.errorMessage}>
                    <error><label>{errorLabel}</label>
                        <message>{errorMessage}</message>
                    </error>
                               </FormHelperText>}
            </FormControl> :
            <div onClick={event => {
            setEdit(true);
            event.stopPropagation();
        }}
            >{Render && <Render value={value} {...props}/>}
            </div>}
        </>
    );
});

Editable.propTypes = {
    render: PropTypes.func,
    isCreateMode: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onEdit: PropTypes.func
};

Editable.displayName = 'Editable'

