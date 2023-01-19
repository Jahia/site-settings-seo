import React from 'react';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {atLeastOneMarkedForDeletion} from '../Utils/Utils';

export const UpdateVanityAction = ({render: Render, actions, urlPair, isDefaultMapping, ...otherProps}) => {
    const {t} = useTranslation('site-settings-seo');

    const label = isDefaultMapping ? t('label.actions.canonical.unset') : t('label.actions.canonical.set');

    const onClick = e => {
        actions.updateVanity.call({urlPair: urlPair, defaultMapping: !isDefaultMapping}, e);
    };

    return (
        <>
            <Render
                {...otherProps}
                isVisible={!atLeastOneMarkedForDeletion([urlPair])}
                buttonLabel={label}
                onClick={onClick}/>
        </>
    );
};

UpdateVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    actions: PropTypes.object,
    urlPair: PropTypes.object.isRequired,
    isDefaultMapping: PropTypes.bool.isRequired
};
