import React from 'react';
import {Dropdown} from '@jahia/moonstone'

class LanguageMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    handleSelect(languageCode) {
        this.props.onLanguageSelected(languageCode);
    }

    render() {
        const {languageCode, languages} = this.props;

        return (
            <Dropdown
                variant="outlined"
                label={languageCode}
                value={languageCode}
                size="small"
                data={languages.map(lang => ({label: `${lang.name} (${lang.code})`, value: lang.code}))}
                onChange={(e, item) => this.handleSelect(item.value)}
            />
        )
    }
}

export {LanguageMenu};
