import React from 'react';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {
    atLeastOneCanonicalLockedForLang,
    getRowUrlsFromPath, updateVanity
} from '../Utils/Utils';
import {useVanityTableDataUrlContext} from '~/components/VanityUrlTableData';
import {useApolloClient} from '@apollo/client';

export const UpdateVanityAction = ({render: Render, urlPair, isDefaultMapping, ...otherProps}) => {
    const {t} = useTranslation('site-settings-seo');
    const client = useApolloClient();

    const {rows} = useVanityTableDataUrlContext();
    const urls = getRowUrlsFromPath(rows, urlPair.default.targetNode.path);

    const label = isDefaultMapping ? t('label.actions.canonical.unset') : t('label.actions.canonical.set');

    const onClick = () => {
        updateVanity({urlPair: urlPair, defaultMapping: !isDefaultMapping}, client, t);
    };

    return (
        <>
            <Render
                {...otherProps}
                enabled={!atLeastOneCanonicalLockedForLang(urls, urlPair.default.language)}
                isVisible={!urlPair.default.lockedAndCannotBeEdited}
                buttonLabel={label}
                onClick={onClick}/>
        </>
    );
};

UpdateVanityAction.propTypes = {
    render: PropTypes.elementType.isRequired,
    urlPair: PropTypes.object.isRequired,
    isDefaultMapping: PropTypes.bool.isRequired
};
