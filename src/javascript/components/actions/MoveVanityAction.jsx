import React, {useContext} from 'react';
import * as PropTypes from 'prop-types';
import {atLeastOneLockedAndCanNotBeEdited} from '../Utils/Utils';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useVanityUrlContext} from '~/components/Context/VanityUrl.context';
import {Move} from '~/components/Move/Move';

export const MoveVanityAction = ({render: Render, actions, urlPairs, ...otherProps}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const {siteInfo, lang} = useVanityUrlContext();

    const closeDialog = () => {
        componentRenderer.destroy('MoveDialog');
    };

    const onClick = () => {
        componentRenderer.render(
            'MoveDialog',
            Move,
            {
                ...otherProps,
                urlPairs: urlPairs,
                isOpen: true,
                path: siteInfo.path,
                lang: lang,
                onClose: closeDialog
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
