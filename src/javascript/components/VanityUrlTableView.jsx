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
        let {rows, selection, onChangeSelection, filterText, actions, languages} = this.props;
        return (
            <div>
                <List>
                    {rows.map(row => (<VanityUrlEnabledContent key={row.uuid} content={row} filterText={filterText} selection={selection} actions={actions} languages={languages} onChangeSelection={onChangeSelection}/>))}
                </List>
                <Pagination {...this.props}/>
            </div>
        );
    }
}

VanityUrlTableView = withTranslation()(VanityUrlTableView);

export {VanityUrlTableView};
