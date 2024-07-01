import {keyBy, merge, values, sortBy, map} from 'lodash';

export const atLeastOneMarkedForDeletion = urls => {
    return urls.some(url => url.default.publicationInfo.publicationStatus === 'MARKED_FOR_DELETION' || url.default.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion'));
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

export  const contentIsVisibleInLive = publicationInfo => {
    return publicationInfo.existsInLive && publicationInfo.publicationStatus !== 'UNPUBLISHED';
};

export const buildTableQueryVariablesOneNode = props => {
    return buildTableQueryVariables(props);
};

export const buildTableQueryVariablesAllVanity = props => {
    return buildTableQueryVariables({query: 'select * from [jmix:vanityUrlMapped] as content where isDescendantNode(\'' + props.path + '\') order by [j:fullpath]', ...props});
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
    query: props.query,
    filterText: props.filterText ? props.filterText : '',
    doFilter: Boolean(props.filterText),
    queryFilter: {
        multi: 'ANY',
        filters: [{fieldName: 'vanityUrls', evaluation: 'NOT_EMPTY'}, {fieldName: 'liveNode.vanityUrls', evaluation: 'NOT_EMPTY'}]
    }
});
