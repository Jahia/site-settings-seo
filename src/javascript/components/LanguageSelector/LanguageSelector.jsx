import React from 'react';
import {withTranslation} from 'react-i18next';
import {Checkbox, ListItemText, MenuItem, Select} from '@material-ui/core';
import scssStyles from './LanguageSelector.scss';

const MAX_SELECTED_LANGUAGE_NAMES_DISPLAYED = 2;

function getNotNullLanguages(selected) {
    // Filter out the All Languages fake (null) language code when handling menu events.
    return selected.filter(selected => selected);
}

class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);
        this.onAllLanguagesChange = this.onAllLanguagesChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getSelectedLanguagesValue = this.getSelectedLanguagesValue.bind(this);
    }

    onAllLanguagesChange(event, checked) {
        if (checked && this.props.selectedLanguageCodes.length === 0) {
            // Was checked while no languages were selected: select all.
            let selectedLanguageCodes = this.props.languages.map(language => language.language);
            this.props.onSelectionChange(selectedLanguageCodes);
        } else {
            // Either was unchecked or was clicked while a part of languages was selected: de-select all.
            this.props.onSelectionChange([]);
        }
    }

    onChange(event) {
        let selectedLanguageCodes = getNotNullLanguages(event.target.value);
        this.props.onSelectionChange(selectedLanguageCodes);
    }

    getSelectedLanguagesValue(selected) {
        let selectedLanguageCodes = getNotNullLanguages(selected).sort();

        if (selectedLanguageCodes.length === 0) {
            return this.props.t('label.languageSelector.noLanguages');
        }

        if (selectedLanguageCodes.length === this.props.languages.length) {
            return this.props.t('label.languageSelector.allLanguages');
        }

        let selectedLanguageNames = selectedLanguageCodes.map(selectedLanguageCode => this.props.languages.find(language => language.language === selectedLanguageCode)?.uiLanguageDisplayName);
        selectedLanguageNames = getNotNullLanguages(selectedLanguageNames).sort();
        if (selectedLanguageNames.length > MAX_SELECTED_LANGUAGE_NAMES_DISPLAYED) {
            // (Too) many languages selected: will display a part of them, plus "N more languages".
            selectedLanguageNames = selectedLanguageNames.slice(0, MAX_SELECTED_LANGUAGE_NAMES_DISPLAYED - 1);
            selectedLanguageNames[selectedLanguageNames.length] = this.props.t('label.languageSelector.moreLanguages', {count: (selectedLanguageCodes.length - selectedLanguageNames.length)});
        }

        let languages = selectedLanguageNames[0];
        for (var i = 1; i < selectedLanguageNames.length; i++) {
            let languageName = selectedLanguageNames[i];
            if (i < selectedLanguageNames.length - 1) {
                languages = this.props.t('label.languageSelector.partialLanguages', {
                    names: languages,
                    nextName: languageName
                });
            } else {
                languages = this.props.t('label.languageSelector.languages', {
                    names: languages,
                    lastName: languageName
                });
            }
        }

        return languages;
    }

    render() {
        let selectedLanguageCodes = this.props.selectedLanguageCodes;
        let allLanguagesChecked = (selectedLanguageCodes.length === this.props.languages.length);
        let allLanguagesIndeterminate = (selectedLanguageCodes.length > 0) && (selectedLanguageCodes.length < this.props.languages.length);

        return (

            <Select
                multiple
                displayEmpty
                value={selectedLanguageCodes}
                renderValue={this.getSelectedLanguagesValue}
                className={scssStyles.languageSelector}
                classes={{icon: scssStyles.icon, selectMenu: scssStyles.selectMenu}}
                style={this.props.style}
                data-vud-role="language-selector"
                onChange={this.onChange}
            >

                {
                    // Render the All Languages checkbox as a menu item so that it is displayed uniformly with individual language items.
                    // However, supply null value to it and ignore it when handling menu change events afterwards; instead handle the checkbox's change event directly.
                }
                <MenuItem value={null} data-vud-role="language-selector-item-all">
                    <Checkbox
                        checked={allLanguagesChecked}
                        indeterminate={allLanguagesIndeterminate}
                        onChange={(event, checked) => this.onAllLanguagesChange(event, checked)}
                    />
                    <ListItemText primary={this.props.t('label.languageSelector.allLanguages')}/>
                </MenuItem>

                {this.props.languages.map(language => {
                    let checked = (selectedLanguageCodes.indexOf(language.language) >= 0);

                    return (
                        <MenuItem
                            key={language.language}
                            value={language.language}
                            data-vud-role="language-selector-item"
                            classes={{selected: scssStyles.selected}}
                        >
                            <Checkbox checked={checked}/>
                            <ListItemText primary={language.uiLanguageDisplayName + ' (' + language.language + ')'} data-vud-role="language-selector-item-label"/>
                        </MenuItem>
                    );
                })}
            </Select>
        );
    }
}

LanguageSelector = (withTranslation('site-settings-seo')(LanguageSelector));

export {LanguageSelector};
