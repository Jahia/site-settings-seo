import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {InfoDialog} from './InfoDialog';
import {Button, Information} from '@jahia/moonstone';

export const OpenInfoDialogButton = ({message, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);

    const closeDialog = () => {
        componentRenderer.destroy('InfoDialog');
    };

    const openDialog = () => {
        componentRenderer.render(
            'InfoDialog',
            InfoDialog,
            {
                message: message,
                isOpen: true,
                onCloseDialog: closeDialog
            });
    };

    return (
        <Button
            {...otherProps}
            variant="ghost"
            icon={<Information/>}
            onClick={openDialog}/>
    );
};

OpenInfoDialogButton.propTypes = {
    message: PropTypes.string.isRequired
};
