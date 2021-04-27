import React from 'react';
import {VanityUrlEnabledContent} from './VanityUrlEnabledContent';
import {List} from '@material-ui/core';
import {Pagination} from '@jahia/react-material';
import {withTranslation} from 'react-i18next';

class VanityUrlTableView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {rows, selection, onChangeSelection, filterText, actions, languages, lang} = this.props;
        return (
            <>
                <List>
                    {rows.map(row => (<VanityUrlEnabledContent key={row.uuid}
                                                               content={row}
                                                               lang={lang}
                                                               filterText={filterText}
                                                               selection={selection}
                                                               actions={actions}
                                                               languages={languages}
                                                               onChangeSelection={onChangeSelection}/>))}
                </List>
                <Pagination {...this.props}/>
            </>
        );
    }
}

VanityUrlTableView = withTranslation('site-settings-seo')(VanityUrlTableView);

export {VanityUrlTableView};
