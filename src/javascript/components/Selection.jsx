import React from 'react';
import {Button, Paper, withStyles} from '@material-ui/core';
import {withTranslation} from 'react-i18next';
import * as _ from 'lodash';
import {fade} from '@material-ui/core/styles/colorManipulator';
import {Clear} from '@material-ui/icons';
import classNames from 'classnames';
import {Typography} from '@jahia/moonstone'

let styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'top 0.3s ease-in 0s',
        top: '-140px',
        padding: '13px 8px 13px 6px',
        margin: '0',
        zIndex: '9999',
        borderRadius: '0',
        width: '100%',
        boxSizing: 'border-box',
        background: 'rgb(41, 49, 54)'
    },
    rootExpanded: {
        top: '-70px'
    },
    closeButtonContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    selected: {
        margin: '14px 0 0 0',
        position: 'relative'
    },
    selectedText: {
        color: 'whitesmoke',
        fontSize: '14px',
        textTransform: 'none',
        fontWeight: '100'
    },
    clearChip: {
        '&:hover': {
            backgroundColor: fade(theme.palette.primary.main, 0.7)
        },
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        position: 'relative',
        margin: '7px 0 0 7px'
    },
    clearIcon: {
        marginLeft: '-2px',
        fontSize: '1rem'
    },
    clearText: {
        marginLeft: theme.spacing.unit,
        float: 'left'
    },
    buttonsBar: {
        margin: '4'
    },
    buttonAction: {
        marginLeft: theme.spacing.unit
    },
    buttonActionLeftIcon: {
        marginRight: '3px'
    },
    publish: {
        '&:hover': {
            backgroundColor: '#21282f'
        },
        backgroundColor: 'transparent',
        color: 'whitesmoke',
        fontSize: '14px',
        textTransform: 'none',
        fontWeight: '100'
    },
    delete: {
        '&:hover': {
            backgroundColor: '#21282f'
        },
        backgroundColor: 'transparent',
        color: 'whitesmoke',
        fontSize: '14px',
        textTransform: 'none',
        fontWeight: '100'
    },
    move: {
        '&:hover': {
            backgroundColor: '#21282f'
        },
        backgroundColor: 'transparent',
        color: 'whitesmoke',
        fontSize: '14px',
        textTransform: 'none',
        fontWeight: '100'
    },
    buttonStyleText: theme.typography.button,
    clearButton: {
        '&:hover': {
            backgroundColor: '#21282f',
            cursor: 'pointer'
        },
        marginTop: '8px',
        marginRight: '4px',
	    marginLeft: '10px',
        padding: '4px',
	    color: 'whitesmoke'
    }
});

class Selection extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {t, selection, classes, onChangeSelection, actions} = this.props;

        return (
            <Paper elevation={1} classes={{root: (selection.length === 0 ? '' : classes.rootExpanded)}} className={classes.root}>

                <div className={classes.closeButtonContainer}>
                    <Clear classes={{root: classes.clearButton}}
                           tooltip={t('label.selection.clear')}
                           onClick={() => onChangeSelection()}/>

                    <div className={classes.selected}>
                        <Typography className={classes.selectedText}>{t('label.selection.count', {count: selection.length})}</Typography>
                    </div>
                </div>

                <div className={classes.buttonsBar}>
                    { _.sortBy(_.filter(actions, x => x.buttonLabel), 'priority').map((action, i) => (
                        <Button key={i}
                                className={classNames(classes[action.className], classes.buttonAction)}
                                data-vud-role={'toolbar-button-' + action.className}
                                onClick={event => {
 action.call(selection, event);
}}
                        >
                            <span className={classes.buttonActionLeftIcon}>{action.buttonIcon}</span>
                            {action.buttonLabel}
                        </Button>
                  )) }
                </div>
            </Paper>
        );
    }
}

Selection = withStyles(styles)(withTranslation('site-settings-seo')(Selection));

export {Selection};
