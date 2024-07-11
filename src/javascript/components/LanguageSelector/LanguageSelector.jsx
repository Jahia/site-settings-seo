import React from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, ListItemText, MenuItem, Select} from '@material-ui/core';
import classes from './LanguageSelector.scss';
import * as PropTypes from 'prop-types';

const MAX_SELECTED_LANGUAGE_NAMES_DISPLAYED = 2;

function getNotNullLanguages(selected) {
    // Filter out the All Languages fake (null) language code when handling menu events.
    return selected.filter(selected => selected);
}

export const LanguageSelector = ({selectedLanguageCodes, languages, onSelectionChange}) => {
    const {t} = useTranslation('site-settings-seo');
    const onAllLanguagesChange = checked => {
        if (checked && selectedLanguageCodes.length === 0) {
            // Was checked while no languages were selected: select all.
            let selectedLanguageCodes = languages.map(language => language.language);
            onSelectionChange(selectedLanguageCodes);
        } else {
            // Either was unchecked or was clicked while a part of languages was selected: de-select all.
            onSelectionChange([]);
        }
    };

    const onChange = event => {
        let selectedLanguageCodes = getNotNullLanguages(event.target.value);
        onSelectionChange(selectedLanguageCodes);
    };

    const getSelectedLanguagesValue = selected => {
        let selectedLanguageCodes = getNotNullLanguages(selected).sort();

        if (selectedLanguageCodes.length === 0) {
            return t('label.languageSelector.noLanguages');
        }

        if (selectedLanguageCodes.length === languages.length) {
            return t('label.languageSelector.allLanguages');
        }

        let selectedLanguageNames = selectedLanguageCodes.map(selectedLanguageCode => languages.find(language => language.language === selectedLanguageCode)?.uiLanguageDisplayName);
        selectedLanguageNames = getNotNullLanguages(selectedLanguageNames).sort();
        if (selectedLanguageNames.length > MAX_SELECTED_LANGUAGE_NAMES_DISPLAYED) {
            // (Too) many languages selected: will display a part of them, plus "N more languages".
            selectedLanguageNames = selectedLanguageNames.slice(0, MAX_SELECTED_LANGUAGE_NAMES_DISPLAYED - 1);
            selectedLanguageNames[selectedLanguageNames.length] = t('label.languageSelector.moreLanguages', {count: (selectedLanguageCodes.length - selectedLanguageNames.length)});
        }

        if (selectedLanguageNames.length === 1) {
            return selectedLanguageNames[0];
        }

        const initialPart = selectedLanguageNames.slice(0, -1).join(', ');

        const lastElement = selectedLanguageNames[selectedLanguageNames.length - 1];

        return `${initialPart} & ${lastElement}`;
    };

    let allLanguagesChecked = selectedLanguageCodes.length === languages.length;
    let allLanguagesIndeterminate = (selectedLanguageCodes.length > 0) && (selectedLanguageCodes.length < languages.length);

    return (
        <Select
            multiple
            displayEmpty
            value={selectedLanguageCodes}
            renderValue={getSelectedLanguagesValue}
            className={classes.languageSelector}
            classes={{icon: classes.icon, selectMenu: classes.selectMenu}}
            data-vud-role="language-selector"
            onChange={onChange}
        >
            {
                // Render the All Languages checkbox as a menu item so that it is displayed uniformly with individual language items.
                // However, supply null value to it and ignore it when handling menu change events afterwards; instead handle the checkbox's change event directly.
            }
            <MenuItem value={null} data-vud-role="language-selector-item-all">
                <Checkbox
                    checked={allLanguagesChecked}
                    indeterminate={allLanguagesIndeterminate}
                    onChange={(event, checked) => onAllLanguagesChange(checked)}
                />
                <ListItemText primary={t('label.languageSelector.allLanguages')}/>
            </MenuItem>

            {languages.map(language => {
                let checked = selectedLanguageCodes.includes(language.language);

                return (
                    <MenuItem
                        key={language.language}
                        value={language.language}
                        data-vud-role="language-selector-item"
                        classes={{selected: classes.selected}}
                    >
                        <Checkbox checked={checked}/>
                        <ListItemText primary={`${language.uiLanguageDisplayName}(${language.language})`}
                                      data-vud-role="language-selector-item-label"/>
                    </MenuItem>
                );
            })}
        </Select>
    );
};

LanguageSelector.propTypes = {
    selectedLanguageCodes: PropTypes.array.isRequired,
    languages: PropTypes.array.isRequired,
    onSelectionChange: PropTypes.func.isRequired
};
