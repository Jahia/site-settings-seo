import React from 'react';
import * as PropTypes from 'prop-types';
import {atLeastOneMarkedForDeletion} from '../Utils/Utils';

export const MoveVanityAction = ({render: Render, actions, urlPairs, ...otherProps}) => {
    const onClick = e => {
        actions.moveAction.call(urlPairs, e);
    };

    return (
        <>
            <Render
                {...otherProps}
                isVisible={!atLeastOneMarkedForDeletion(urlPairs)}
                onClick={onClick}/>
        </>
    );
};

MoveVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    actions: PropTypes.object,
    urlPairs: PropTypes.array.isRequired
};
