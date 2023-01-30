import React from 'react';
import {Dropdown} from '@jahia/moonstone';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from './Context/VanityUrl.context';

export const LanguageMenu = ({languageCode, onLanguageSelected, isDisabled}) => {
    const {languages} = useVanityUrlContext();

    return (
        <Dropdown
            variant="outlined"
            label={languageCode}
            value={languageCode}
            isDisabled={isDisabled}
            size="small"
            data-sel-role="vanity-language-menu"
            data={languages.map(lang => ({label: `${lang.displayName} (${lang.language})`, value: lang.language, attributes: {'data-sel-value': lang.language}}))}
            onChange={(e, item) => onLanguageSelected(item.value)}
        />
    );
};

LanguageMenu.propTypes = {
    languageCode: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    onLanguageSelected: PropTypes.func.isRequired
};

