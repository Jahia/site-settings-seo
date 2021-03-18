import {DefaultVanityUrls, LiveVanityUrls} from './gqlFragments';
import {PredefinedFragments} from '@jahia/apollo-dx';
import gql from 'graphql-tag';

const TableQuery = gql`
    query NodesQuery($lang: String!, $offset: Int, $limit: Int, $query: String!, $filterText: String, $doFilter: Boolean!, $queryFilter: InputFieldFiltersInput, $languages: [String!]) {
        jcr {
            nodesByQuery(query: $query, limit: $limit, offset: $offset, fieldFilter: $queryFilter) {
                pageInfo {
                    totalCount
                }
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

const LanguagesQuery = gql`
    query LanguagesQuery($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                site {
                    languages {
                        code: language
                        name: displayName
                        activeInEdit
                    }
                }
            }
        }
    }
`;

const TableQueryVariables = props => ({
    lang: props.lang,
    languages: props.selectedLanguageCodes,
    offset: (props.currentPage * props.pageSize),
    limit: props.pageSize,
    query: 'select * from [jmix:vanityUrlMapped] as content where isDescendantNode(\'' + props.path + '\') order by [j:fullpath]',
    filterText: props.filterText,
    doFilter: Boolean(props.filterText),
    queryFilter: {multi: 'ANY', filters: [{fieldName: 'vanityUrls', evaluation: 'NOT_EMPTY'}, {fieldName: 'liveNode.vanityUrls', evaluation: 'NOT_EMPTY'}]}
});

const VanityUrlsByPath = gql`
    query NodesbyPath($paths: [String!]!, $lang: String!, $filterText: String, $doFilter: Boolean!, $languages: [String!]) {
        jcr {
            nodesByPath(paths: $paths) {
                ...NodeCacheRequiredFields
                displayName(language: $lang)
                ...DefaultVanityUrls
                ...LiveVanityUrls
            }
        }
    }
    ${DefaultVanityUrls}
    ${LiveVanityUrls}
`;

const VanityUrlsByPathVariables = (paths, props) => ({
    lang: props.lang,
    languages: props.selectedLanguageCodes,
    filterText: props.filterText,
    doFilter: Boolean(props.filterText),
    paths: paths
});

const GetNodeQuery = gql`
    query GetNodeQuery($path:String!) {
        jcr {
            nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                inPicker : isNodeType(type: {types:["jnt:page"]})
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {TableQuery, LanguagesQuery, GetNodeQuery, TableQueryVariables, VanityUrlsByPath, VanityUrlsByPathVariables};
