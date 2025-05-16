import {keyBy, merge, values, sortBy, map} from 'lodash';
import SiteSettingsSeoConstants from '../SiteSettingsSeoApp.constants';
import {InvalidCharError, InvalidMappingError, SitesMappingError} from '~/components/Errors';
import {UpdateVanityMutation} from '~/components/gqlMutations';

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

export const handleServerError = (ex, onError, t) => {
    let err;
    let mess;
    if (ex.graphQLErrors && ex.graphQLErrors.length > 0) {
        let graphQLError = ex.graphQLErrors[0];
        const messageKey = graphQLError.extensions.existingNodePath ? 'used' : 'notAllowed';
        err = t(`label.errors.GqlConstraintViolationException.${messageKey}`);
        mess = t(`label.errors.GqlConstraintViolationException.${messageKey}_message`, graphQLError.extensions);
        if (graphQLError.extensions.errorMessage) {
            console.error(graphQLError.extensions.errorMessage);
        }
    } else {
        err = t(['label.errors.' + ex.name, 'label.errors.Error']);
        mess = t(['label.errors.' + ex.name + '_message', ex.message]);
    }

    if (onError) {
        onError(err, mess);
    }
};

export const updateVanity = (data, client, t) => {
    const {urlPair, defaultMapping, active, url, language, onSuccess, onError, refetch} = data;
    if (isBlankUrl(url)) {
        throw new InvalidMappingError(url);
    }

    if (containsInvalidChars(url)) {
        throw new InvalidCharError(url);
    }

    if (isSitesUrl(url)) {
        throw new SitesMappingError(url);
    }

    client.mutate({
        mutation: UpdateVanityMutation,
        variables: {
            ids: [urlPair.uuid],
            defaultMapping: language ? false : defaultMapping,
            active: active,
            language: language,
            url: url,
            lang: window.contextJsParameters.lang
        }
    }).then(() => {
        if (onSuccess) {
            onSuccess();
        }

        if (refetch) {
            refetch();
        }
    }).catch(ex => {
        handleServerError(ex, onError, t);
    });
};
