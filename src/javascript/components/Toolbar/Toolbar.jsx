import React from 'react';
import {useTranslation} from 'react-i18next';
import {Close, Typography} from '@jahia/moonstone';
import classes from './Toolbar.scss';
import * as PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';
import clsx from 'clsx';
import {DisplayActions} from '@jahia/ui-extender';
import {ButtonRenderer} from '@jahia/jcontent';

export const Toolbar = ({selection, onChangeSelection, actions}) => {
    const {t} = useTranslation('site-settings-seo');

    let paths = selection.map(url => url.default.path);

    return (
        <Paper elevation={1}
               className={clsx(classes.root, {[classes.rootExpanded]: selection.length > 0})}
        >
            <div className={classes.closeButtonContainer}>
                <Close className={classes.clearButton}
                       tooltip={t('label.selection.clear')}
                       onClick={() => onChangeSelection()}/>
                <div>
                    <Typography
                        className={classes.selectedText}
                    >{t('label.selection.count', {count: selection.length})}
                    </Typography>
                </div>
            </div>
            {selection.length &&
                <div className={classes.buttonsBar}>
                    <DisplayActions
                        target="site-settings-seo/vanity-list-menu"
                        urlPairs={selection}
                        paths={paths}
                        actions={actions}
                        render={ButtonRenderer}
                        filter={action => {
                            return !['updateVanity', 'unpublish'].includes(action.key);
                        }}
                        onChangeSelection={onChangeSelection}
                        onDeleted={onChangeSelection}
                    />
                </div>}
        </Paper>
    );
};

Toolbar.propTypes = {
    selection: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    onChangeSelection: PropTypes.func.isRequired
};
