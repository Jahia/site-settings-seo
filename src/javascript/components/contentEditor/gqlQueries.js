import {DefaultVanityUrls, LiveVanityUrls} from '../gqlFragments';
import gql from 'graphql-tag';

const TableQuery = gql`
    query NodesQuery($query: String!, $lang: String!, $filterText: String, $doFilter: Boolean!, $languages: [String!], $queryFilter: InputFieldFiltersInput) {
        jcr {
            nodesByQuery(query: $query, fieldFilter: $queryFilter) {
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

const TableQueryVariables = props => ({
    lang: props.lang,
    languages: props.selectedLanguageCodes,
    offset: (props.currentPage * props.pageSize),
    limit: props.pageSize,
    query: 'select * from [jmix:vanityUrlMapped] as content where content.[j:fullpath] = \'' + props.path + '\'',
    filterText: props.filterText,
    doFilter: Boolean(props.filterText),
    queryFilter: {multi: 'ANY', filters: [{fieldName: 'vanityUrls', evaluation: 'NOT_EMPTY'}, {fieldName: 'liveNode.vanityUrls', evaluation: 'NOT_EMPTY'}]}
});

export {TableQuery, TableQueryVariables};
