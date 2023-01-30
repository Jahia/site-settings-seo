import {keyBy, merge, values, sortBy, map} from 'lodash';

export const hasMixin = (node, mixin) => {
    if (node.mixinTypes) {
        return node.mixinTypes.find(mixinType => mixinType.name === mixin) !== undefined;
    }

    let mixinTypesProperty = node.properties.find(property => property.name === 'jcr:mixinTypes');
    if (mixinTypesProperty) {
        return mixinTypesProperty.values.includes(mixin);
    }

    return false;
};

export const isMarkedForDeletion = url => {
    return hasMixin(url, 'jmix:markedForDeletion');
};

export const atLeastOneMarkedForDeletion = urls => {
    return urls.some(url => url.default.publicationInfo.publicationStatus === 'MARKED_FOR_DELETION' || url.default.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion'));
};

export const allNotPublishedAndMarkedForDeletion = urls => {
    return urls.every(url => !url.live && url.default.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion'));
};

export const atLeastOneNotPublished = urls => {
    return urls.some(url => url.default.publicationInfo.publicationStatus !== 'PUBLISHED');
};

export const buildTableQueryVariablesOneNode = props => {
    return buildTableQueryVariables({query: `/jcr:root${encodePathForJCR(props.path)}`, ...props});
};

export const buildTableQueryVariablesAllVanity = props => {
    return buildTableQueryVariables({query: 'select * from [jmix:vanityUrlMapped] as content where isDescendantNode(\'' + props.path + '\') order by [j:fullpath]', ...props});
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

// See https://stackoverflow.com/questions/23388485/xpath-whitespace-encoding for details
const encodePathForJCR = path => path
    .replaceAll(' ', '_x0020_')
    .replaceAll(/\/(\d)/g, (_, s) => '/_x00' + s.charCodeAt(0).toString(16).slice(-4) + '_');

const buildTableQueryVariables = props => ({
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
