import {DefaultVanityUrls, LiveVanityUrls} from './gqlFragments';
import {PredefinedFragments} from '@jahia/data-helper';
import gql from 'graphql-tag';

const DashboardTableQuery = gql`
    query NodesQuery($lang: String!, $offset: Int, $limit: Int, $query: String!, $filterText: String, $doFilter: Boolean!, $queryFilter: InputFieldFiltersInput, $languages: [String!]) {
        jcr {
            nodesByQuery(query: $query, limit: $limit, offset: $offset, fieldFilter: $queryFilter) {
                pageInfo {
                    totalCount
                }
                nodes {
                    ...NodeCacheRequiredFields
                    hasWritePermission: hasPermission(permissionName: "jcr:write")
                    mixinTypes{
                        name
                    }
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

const ContentEditorTableQuery = gql`
    query NodeByPath($path: String!, $lang: String!, $filterText: String = "", $doFilter: Boolean!, $languages: [String!]) {
        jcr {
            nodeByPath(path: $path) {
                ...NodeCacheRequiredFields
               mixinTypes{
                    name
                }
                displayName(language: $lang)
                hasWritePermission: hasPermission(permissionName: "jcr:write")
                ...DefaultVanityUrls
                ...LiveVanityUrls
            }
        }
    }
    ${DefaultVanityUrls}
    ${LiveVanityUrls}
`;

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
    query GetNodeQuery($path:String!, $types: [String]!) {
        jcr {
            nodeByPath(path:$path) {
                ...NodeCacheRequiredFields
                inPicker : isNodeType(type: {types:$types})
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

export {DashboardTableQuery, ContentEditorTableQuery, GetNodeQuery, VanityUrlsByPath, VanityUrlsByPathVariables};
