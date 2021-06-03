import React from 'react';

import {FormControl, FormHelperText, IconButton, withStyles, Input} from '@material-ui/core';
import {Check, Clear} from '@material-ui/icons';

let styles = theme => ({
    root: {
        width: 'calc(100% + 72px)',
        zIndex: '9'
    },
    button: {
        height: 18,
        width: 18,
        position: 'absolute',
        top: 4,
        transform: 'scale(0.75)',
        '&:hover': {
            backgroundColor: 'inherit'
        }
    },
    cancel: {
        color: 'red',
        right: '10px',
        top: '6px'
    },
    valid: {
        color: 'green',
        right: '32px',
        top: '6px'
    },
    textInput: {
        color: 'inherit',
        fontSize: 'inherit',
        width: '100%',
        paddingRight: '60px',
        fontFamily: 'Nunito, "Nunito Sans"'
    }
});

class Editable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            loading: false,
            errorLabel: null,
            errorMessage: null,
            value: props.value
        };
        this.onValueChange = this.onValueChange.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.ref = this.ref.bind(this);
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        // Render only if the edit state change or edit is active
        return this.state.edit !== nextState.edit || this.state.edit;
    }

    setEdit(event, edit) {
        let {onChange, onEdit} = this.props;
        let {value} = this.state;
        if (!edit) {
            if (onChange.length === 1) {
                onChange(value);
                this.setState({edit: false, errorLabel: null, errorMessage: null}, () => onEdit(this.state.edit));
            } else {
                this.setState({loading: true});
                onChange(value,
                    () => {
                        this.setState({loading: false, edit: false, errorLabel: null, errorMessage: null}, () => onEdit(this.state.edit));
                    },
                    (errorLabel, errorMessage) => {
                        this.setState({loading: false, errorLabel: errorLabel, errorMessage: errorMessage}); this.nativeInput.focus();
                    }
                );
            }
        } else {
            this.setState({edit: true}, () => onEdit(this.state.edit));
        }

        event.stopPropagation();
    }

    ref(input) {
        this.nativeInput = input;

        if (input) {
            input.focus();
        }
    }

    save(event) {
        this.setEdit(event, false);
        event.stopPropagation();
    }

    cancel(event) {
        const {value, onEdit} = this.props;
        this.setState({edit: false, value: value, errorLabel: null, errorMessage: null}, () => onEdit(this.state.edit));
        event.stopPropagation();
    }

    onValueChange(event) {
        this.setState({value: event.target.value, errorLabel: null, errorMessage: null});
    }

    render() {
        let {render: Render, classes} = this.props;
        let {edit, loading, value, errorLabel, errorMessage} = this.state;

        return edit ?
            <FormControl className={classes.root}>

                <Input value={value}
                       disabled={loading}
                       error={Boolean(errorLabel)}
                       classes={{root: classes.textInput}}
                       inputRef={this.ref}
                       onChange={this.onValueChange}
                       onClick={e => {
e.stopPropagation();
}}
                       onBlur={this.save}
                       onKeyUp={e => {
if (e.key === 'Enter') {
 this.save(e);
} else if (e.key === 'Escape') {
 this.cancel(e);
}
}}/>

                { errorLabel && <FormHelperText><error><label>{errorLabel}</label><message>{errorMessage}</message></error></FormHelperText> }
                <IconButton disableRipple className={classes.button + ' ' + classes.valid} component="span" onClick={this.save}>
                    <Check/>
                </IconButton>
                <IconButton disableRipple className={classes.button + ' ' + classes.cancel} component="span" onClick={this.cancel}>
                    <Clear/>
                </IconButton>
            </FormControl> :
            <div onClick={event => {
this.setEdit(event, true);
}}
            ><Render value={value} {...this.props}/>
            </div>;
    }
}

Editable = withStyles(styles)(Editable);

export {Editable};
