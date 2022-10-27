import {DefaultVanityUrls, LiveVanityUrls} from '../../gqlFragments';
import gql from 'graphql-tag';

const TableQuery = gql`
    query NodesQuery($query: String!, $lang: String!, $filterText: String, $doFilter: Boolean!, $languages: [String!], $queryFilter: InputFieldFiltersInput) {
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

// See https://stackoverflow.com/questions/23388485/xpath-whitespace-encoding for details
const encodePathForJCR = path => path
    .replaceAll(' ', '_x0020_')
    .replaceAll(/\/(\d)/g, (_, s) => '/_x00' + s.charCodeAt(0).toString(16).slice(-4) + '_');

const TableQueryVariables = props => ({
    lang: props.lang,
    languages: props.selectedLanguageCodes,
    offset: (props.currentPage * props.pageSize),
    limit: props.pageSize,
    query: `/jcr:root${encodePathForJCR(props.path)}`,
    filterText: props.filterText,
    doFilter: Boolean(props.filterText),
    queryFilter: {multi: 'ANY', filters: [{fieldName: 'vanityUrls', evaluation: 'NOT_EMPTY'}, {fieldName: 'liveNode.vanityUrls', evaluation: 'NOT_EMPTY'}]}
});

export {TableQuery, TableQueryVariables};
