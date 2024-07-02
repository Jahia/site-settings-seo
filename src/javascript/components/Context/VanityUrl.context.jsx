import React, {useContext} from 'react';
import * as PropTypes from 'prop-types';
import {useSiteInfo} from '@jahia/data-helper';

export const VanityUrlContext = React.createContext({});
export const useVanityUrlContext = () => useContext(VanityUrlContext);

export const VanityUrlContextProvider = ({siteKey, children}) => {
    const {data, loading, error} = useSiteInfo({
        siteKey: siteKey,
        displayLanguage: window.contextJsParameters.lang,
        uiLanguage: window.contextJsParameters.uilang
    });

    if (error) {
        return <>{error.message}</>;
    }

    if (loading) {
        return (<></>);
    }

    const site = data?.jcr?.result?.site || {};

    const context = {
        languages: site?.languages
            ?.filter(language => language.activeInEdit)
            .sort(function (a, b) {
                return a.language.localeCompare(b.language);
            }),
        lang: window.contextJsParameters.lang,
        siteInfo: {
            displayName: site.displayName,
            uuid: site.uuid,
            path: site.path
        }
    };

    return (
        <VanityUrlContext.Provider value={context}>
            {children}
        </VanityUrlContext.Provider>
    );
};

VanityUrlContextProvider.propTypes = {
    siteKey: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};
