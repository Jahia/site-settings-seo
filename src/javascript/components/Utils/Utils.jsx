import {keyBy, merge, values, sortBy, map} from 'lodash';
import SiteSettingsSeoConstants from '../SiteSettingsSeoApp.constants';

export const atLeastOneLockedAndCanNotBeEdited = urls => {
    return urls.some(url => url.default.lockedAndCannotBeEdited);
};

export const atLeastOneLockedForValidation = urls => {
    return urls?.some(url => url?.default?.lockedAndCannotBeEdited && url.default?.lockInfo.details.some(detail => detail.type === 'validation'));
};

export const atLeastOneCanonicalLockedForLang = (urls, lang) => {
    return urls.some(url => url.default && url.default.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion') && url.default.language === lang && url.default.default);
};

export const allNotPublishedAndMarkedForDeletion = urls => {
    return urls.every(url => !url.live && url.default.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion'));
};

export const atLeastOneNotPublished = urls => {
    return urls.some(url => url.default.publicationInfo.publicationStatus !== 'PUBLISHED');
};

export const contentIsVisibleInLive = publicationInfo => {
    return publicationInfo.existsInLive && publicationInfo.publicationStatus !== 'UNPUBLISHED';
};

export const buildTableQueryVariablesOneNode = props => {
    return buildTableQueryVariables(props);
};

export const buildTableQueryVariablesAllVanity = props => {
    return buildTableQueryVariables({
        criteria: {
            paths: props.path,
            nodeType: 'jmix:vanityUrlMapped'
        }, fieldSorter: {
            fieldName: 'displayName',
            sortType: 'ASC'
        }, ...props
    });
};

export const getRowUrlsFromPath = (rows, path) => {
    const targetRow = rows.find(row => {
        return row.path === path;
    });
    return targetRow.allUrls || targetRow.urls;
};

export const gqlContentNodeToVanityUrlPairs = (gqlContentNode, vanityUrlsFieldName) => {
    let defaultUrls = keyBy(map(gqlContentNode[vanityUrlsFieldName], vanityUrlNode => ({
        uuid: vanityUrlNode.uuid,
        default: vanityUrlNode
    })), 'uuid');
    let liveUrls = gqlContentNode.liveNode ? keyBy(map(gqlContentNode.liveNode[vanityUrlsFieldName], vanityUrlNode => ({
        uuid: vanityUrlNode.uuid,
        live: vanityUrlNode
    })), 'uuid') : {};
    let urlPairs = merge(defaultUrls, liveUrls);
    urlPairs = sortBy(urlPairs, urlPair => (urlPair.default ? urlPair.default.language : urlPair.live.language));
    return values(urlPairs);
};

const buildTableQueryVariables = props => ({
    path: props.path,
    lang: props.lang,
    languages: props.selectedLanguageCodes,
    offset: (props.currentPage * props.pageSize),
    limit: props.pageSize,
    criteria: props.criteria,
    filterText: props.filterText ? props.filterText : '',
    fieldSorter: props.fieldSorter ? props.fieldSorter : null,
    doFilter: Boolean(props.filterText),
    queryFilter: {
        multi: 'ANY',
        filters: [{fieldName: 'vanityUrls', evaluation: 'NOT_EMPTY'}, {
            fieldName: 'liveNode.vanityUrls',
            evaluation: 'NOT_EMPTY'
        }]
    }
});

export const isSitesUrl = url => {
    const isString = (typeof url === 'string') || url instanceof String;
    return (isString && SiteSettingsSeoConstants.SITES_REG_EXP.test(url.trim()));
};

export const isBlankUrl = url => {
    const isString = (typeof url === 'string') || url instanceof String;
    return (isString && !url.trim());
};

export const containsInvalidChars = url => {
    const isString = (typeof url === 'string') || url instanceof String;
    return (isString && SiteSettingsSeoConstants.INVALID_CHARS_REG_EXP.test(url.trim()));
};
