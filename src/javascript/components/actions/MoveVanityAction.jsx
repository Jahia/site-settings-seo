import React, {useContext} from 'react';
import * as PropTypes from 'prop-types';
import {atLeastOneLockedAndCanNotBeEdited} from '../Utils/Utils';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useVanityUrlContext} from '~/components/Context/VanityUrl.context';
import {MoveValidationDialog} from '~/components/Move/MoveValidationDialog';

export const MoveVanityAction = ({render: Render, actions, urlPairs, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const {siteInfo, lang} = useVanityUrlContext();
    const closeDialog = () => {
        componentRenderer.destroy('MoveDialog');
    };

    const onClick = () => {
        window.CE_API.openPicker({
            type: 'targetOnMoveVanity',
            value: '',
            setValue: pickerResult => {
                componentRenderer.render(
                    'MoveDialog',
                    MoveValidationDialog,
                    {
                        ...otherProps,
                        urlPairs: urlPairs,
                        isOpen: true,
                        targetPath: pickerResult[0].path,
                        onClose: closeDialog
                    });
            },
            site: siteInfo.siteKey,
            lang
        });
    };

    return (
        <>
            <Render
                {...otherProps}
                isVisible={!atLeastOneLockedAndCanNotBeEdited(urlPairs)}
                onClick={onClick}/>
        </>
    );
};

MoveVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    actions: PropTypes.object,
    urlPairs: PropTypes.array.isRequired
};
