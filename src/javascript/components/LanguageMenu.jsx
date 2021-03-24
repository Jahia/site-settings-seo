import React from 'react';
import {Button, Menu, MenuItem, withStyles} from '@material-ui/core';
import {ArrowDropDown} from '@material-ui/icons';

const styles = theme => ({
    langButton: {
        background: 'transparent',
        padding: '2px 0 2px 6px',
        fontSize: '0.8rem',
        borderRadius: '0',
        height: 'auto',
        minHeight: 'auto',
        minWidth: '60px',
        textTransform: 'none',
        color: '#676767',
        '&:hover $rightIcon': {
            transition: ['opacity', '0.25s'],
            opacity: 1
        },
        '&:hover': {
            backgroundColor: 'white'
        }
    },
    rightIcon: {
        marginLeft: '0px',
        opacity: 0,
        width: '0.8em'
    }
});

class LanguageMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClick(event) {
        event.stopPropagation();
        this.setState({anchorEl: event.currentTarget});
    }

    handleClose(event) {
        event.stopPropagation();
        this.setState({anchorEl: null});
    }

    handleSelect(languageCode, event) {
        this.handleClose(event);
        this.props.onLanguageSelected(languageCode);
    }

    render() {
        const {anchorEl} = this.state;
        const {languageCode, languages, classes} = this.props;

        return (
            <div>
                <Button className={classes.langButton} data-vud-role="language-menu-button" onClick={this.handleClick}>
                    {languageCode}
                    <ArrowDropDown className={classes.rightIcon}/>
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} data-vud-role="language-menu" onClose={this.handleClose}>
                    {languages.map(language => <MenuItem key={language.code} onClick={event => this.handleSelect(language.code, event)}>{language.name} ({language.code})</MenuItem>)}
                </Menu>
            </div>
        );
    }
}

LanguageMenu = withStyles(styles)(LanguageMenu);

export {LanguageMenu};
