import React from 'react';
import {List} from '@material-ui/core';
import {Pagination} from '@jahia/react-material';
import {withTranslation} from 'react-i18next';

class VanityUrlTableView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <List>
                    {this.props.children}
                </List>
                <Pagination {...this.props}/>
            </>
        );
    }
}

VanityUrlTableView = withTranslation('site-settings-seo')(VanityUrlTableView);

export {VanityUrlTableView};
