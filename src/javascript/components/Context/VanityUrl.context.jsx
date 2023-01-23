import React, {useContext} from 'react';
import * as PropTypes from 'prop-types';
import {useQuery} from 'react-apollo';
import {LanguagesQuery} from '../gqlQueries';

export const VanityUrlContext = React.createContext({});
export const useVanityUrlContext = () => useContext(VanityUrlContext);

export const VanityUrlContextProvider = ({path, children}) => {
    const {data, loading, error} = useQuery(LanguagesQuery, {variables: {path: path}});

    if (error) {
        return <>{error.message}</>;
    }

    if (loading) {
        return (<></>);
    }

    const context = {
        languages: data?.jcr?.nodeByPath?.site?.languages
            ?.filter(language => language.activeInEdit)
            .sort(function (a, b) {
                return a.code.localeCompare(b.code);
            }),
        lang: window.contextJsParameters.lang
    };

    return (
        <VanityUrlContext.Provider value={context}>
            {children}
        </VanityUrlContext.Provider>
    );
};

VanityUrlContextProvider.propTypes = {
    path: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
};
