import gql from 'graphql-tag';
import {PredefinedFragments} from '@jahia/apollo-dx';

const DefaultVanityUrlFields = gql`fragment DefaultVanityUrlFields on VanityUrl {
        ...NodeCacheRequiredFields
        active
        default
        url
        language
        targetNode {
            ...NodeCacheRequiredFields
        }
        liveNode: nodeInWorkspace(workspace: LIVE) {
            ...NodeCacheRequiredFields
            ...on VanityUrl {
                language
            }
        }
        publicationInfo: aggregatedPublicationInfo(language: $lang) {
            publicationStatus
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const LiveVanityUrlFields = gql`fragment LiveVanityUrlFields on VanityUrl {
        ...NodeCacheRequiredFields
        active
        default
        url
        language
        targetNode {
            ...NodeCacheRequiredFields
        }
        editNode: nodeInWorkspace(workspace: EDIT) {
            ...NodeCacheRequiredFields
            ...on VanityUrl {
                targetNode {
                    ...NodeCacheRequiredFields
                    displayName(language: $lang)
                }
                language
            }
        }
        parent{uuid}
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}
`;

const SearchFilter = 'fieldName: "url", evaluation: CONTAINS_IGNORE_CASE, value: $filterText';

const DefaultLanguageFilter = `fieldFilter: {multi: ANY, filters: [
    {fieldName: "language", evaluation: AMONG, values: $languages},
    {fieldName: "liveNode.language", evaluation: AMONG, values: $languages}
]}`;

const LiveLanguageFilter = `fieldFilter: {multi: ANY, filters: [
    {fieldName: "language", evaluation: AMONG, values: $languages},
    {fieldName: "editNode.language", evaluation: AMONG, values: $languages}
]}`;

const DefaultVanityUrls = gql`fragment DefaultVanityUrls on JCRNode {
        vanityUrls(fieldFilter: {filters: [{${SearchFilter}}, {${DefaultLanguageFilter}}]}) {
            ...DefaultVanityUrlFields
        }
        allVanityUrls: vanityUrls(${DefaultLanguageFilter}) @include(if: $doFilter) {
            ...DefaultVanityUrlFields
        }
    }
    ${DefaultVanityUrlFields}
`;

const LiveVanityUrls = gql`fragment LiveVanityUrls on JCRNode {
        liveNode: nodeInWorkspace(workspace: LIVE) {
            vanityUrls(fieldFilter: {filters: [{${SearchFilter}}, {${LiveLanguageFilter}}]}) {
                ...LiveVanityUrlFields
            }
            allVanityUrls: vanityUrls(${LiveLanguageFilter}) @include(if: $doFilter) {
                ...LiveVanityUrlFields
            }
        }
    }
    ${LiveVanityUrlFields}
`;

export {DefaultVanityUrlFields, LiveVanityUrlFields, DefaultVanityUrls, LiveVanityUrls};
