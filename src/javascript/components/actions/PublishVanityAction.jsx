import React from 'react';
import * as PropTypes from 'prop-types';
import {allNotPublishedAndMarkedForDeletion, atLeastOneNotPublished} from '../Utils/Utils';

export const PublishVanityAction = ({render: Render, actions, urlPairs, ...otherProps}) => {
    const onClick = e => {
        actions.publishAction.call(urlPairs, e);
    };

    const shouldBeHidden = allNotPublishedAndMarkedForDeletion(urlPairs) && atLeastOneNotPublished(urlPairs);
    return (
        <>
            <Render
                {...otherProps}
                isVisible={!shouldBeHidden}
                onClick={onClick}/>
        </>
    );
};

PublishVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    actions: PropTypes.object,
    urlPairs: PropTypes.array.isRequired
};
