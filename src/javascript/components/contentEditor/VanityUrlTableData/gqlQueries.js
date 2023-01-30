import {DefaultVanityUrls, LiveVanityUrls} from '../../gqlFragments';
import gql from 'graphql-tag';

const TableQuery = gql`
    query NodesQuery($query: String!, $lang: String!, $filterText: String = "", $doFilter: Boolean!, $languages: [String!], $queryFilter: InputFieldFiltersInput) {
        jcr {
            nodesByQuery(query: $query, queryLanguage: XPATH, fieldFilter: $queryFilter) {
                nodes {
                    ...NodeCacheRequiredFields
                    displayName(language: $lang)
                    ...DefaultVanityUrls
                    ...LiveVanityUrls
                }
            }
        }
    }
    ${DefaultVanityUrls}
    ${LiveVanityUrls}
`;

export {TableQuery};
