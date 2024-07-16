import React from 'react';
import * as PropTypes from 'prop-types';
import {atLeastOneLockedAndCanNotBeEdited} from '../Utils/Utils';

export const MoveVanityAction = ({render: Render, actions, urlPairs, ...otherProps}) => {
    const onClick = e => {
        actions.moveAction.call(urlPairs, e);
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
