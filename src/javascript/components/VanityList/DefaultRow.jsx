import React from 'react';
import {Switch, TableCell, TableRow} from '@material-ui/core';
import {Editable} from '../Editable';
import classes from './DefaultRow.scss';
import {Chip, Loader, Lock, Typography, Checkbox} from '@jahia/moonstone';
import {LanguageMenu} from '../LanguageMenu';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererNoLabel} from '@jahia/jcontent';
import {useTranslation} from 'react-i18next';
import * as PropTypes from 'prop-types';
import clsx from 'clsx';
import {useVanityTableDataUrlContext} from '~/components/VanityUrlTableData';
import {useApolloClient} from '@apollo/client';
import {updateVanity} from '~/components/Utils/Utils';

export const DefaultRow = ({
    hasWritePermission,
    urlPair,
    isCheckboxesDisplayed,
    onChangeSelection,
    isExpanded,
    selection,
    isOpenCardMode
}) => {
    const {t} = useTranslation('site-settings-seo');

    const {refetch} = useVanityTableDataUrlContext();
    const client = useApolloClient();

    const onMappingChanged = (value, onSuccess, onError) => {
        if (!value) {
            onError(t('label.errors.InvalidMappingError'), t('label.errors.InvalidMappingError_message'));
        } else if (/[:*?"<>|%+]/.test(value)) {
            onError(t('label.errors.GqlConstraintViolationException.notAllowedChars'), t('label.errors.GqlConstraintViolationException.notAllowed_message', {urlMapping: value}));
        } else if (value.endsWith('.do')) {
            onError(t('label.errors.GqlConstraintViolationException.notAllowedDotDo'), t('label.errors.GqlConstraintViolationException.notAllowed_message', {urlMapping: value}));
        } else {
            updateVanity({urlPair: urlPair, url: value, onSuccess: onSuccess, onError: onError, refetch: refetch}, client, t);
        }
    };

    const getLockedDetails = node => {
        const LOCK_TYPE_VALIDATION = 'validation';
        const LOCK_TYPE_DELETION = 'deletion';

        if (node.lockInfo) {
            let lockInfoDetails = node.lockInfo.details.find(detail => detail.type === LOCK_TYPE_VALIDATION || detail.type === LOCK_TYPE_DELETION);
            if (lockInfoDetails) {
                return {
                    message: t(`site-settings-seo:label.status.${lockInfoDetails.type}`),
                    type: lockInfoDetails.type
                };
            }
        }

        return null;
    };

    const url = urlPair.default;

    const selected = Boolean(selection.find(p => p.uuid === urlPair.uuid));

    if (url) {
        const statuses = [
            {key: 'PUBLISHED', value: classes.isPublished},
            {key: 'MODIFIED', value: classes.toBePublished},
            {key: 'CONFLICT', value: classes.notPublished},
            {key: 'NOT_PUBLISHED', value: classes.notPublished},
            {key: 'UNPUBLISHED', value: classes.unPublished}
        ];

        const isMarkedForDeletion = url.publicationInfo.publicationStatus === 'MARKED_FOR_DELETION' || url.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion');
        const isLockedAndCannotBeEdited = url.lockedAndCannotBeEdited;
        const lockedDetails = getLockedDetails(url);
        return (
            <TableRow key={urlPair.uuid}
                      hover
                      className={clsx(classes.tableRow, {[classes.inactive]: !url.active})}
                      classes={{
                          root: classes.vanityUrl,
                          hover: (isMarkedForDeletion ? classes.isMarkedForDeletion : statuses.find(status => status.key === url.publicationInfo.publicationStatus)?.value)
                      }}
                      data-vud-url={url.url}
                      data-sel-marked-for-deletion={isMarkedForDeletion}
                      data-sel-locked-and-can-not-be-edited={isLockedAndCannotBeEdited}
            >
                <TableCell
                    className={(isCheckboxesDisplayed ? (isExpanded ? '' : classes.hidden) : (classes.hiddenOnHover)) + ' ' + classes.checkboxLeft}
                    width="3%"
                >
                    {!isOpenCardMode && <Checkbox isDisabled={!hasWritePermission}
                                                  data-sel-role="select-vanity"
                                                  checked={selected}
                                                  onChange={event => onChangeSelection(event.currentTarget.checked, [urlPair])}/>}
                </TableCell>
                <TableCell width="55px">
                    <Switch classes={{switchBase: classes.switchBase, checked: classes.switchChecked}}
                            checked={url.active}
                            disabled={Boolean(isMarkedForDeletion) || Boolean(!hasWritePermission) || Boolean(isLockedAndCannotBeEdited)}
                            data-vud-role="action-active"
                            onClick={event => {
                                event.stopPropagation();
                            }}
                            onChange={event => updateVanity({
                                urlPair: urlPair,
                                active: event.target.checked
                            }, client, t)}/>
                </TableCell>
                <TableCell className={clsx(classes.tableCellTextInput, {[classes.inactive]: !url.active})} width="100%">
                    {(isMarkedForDeletion || !hasWritePermission || isLockedAndCannotBeEdited) &&
                        <Typography data-vud-role="url"
                                    className={isMarkedForDeletion ? classes.deletedUrl : ''}
                        >
                            {url.url}
                        </Typography>}
                    {!isMarkedForDeletion && hasWritePermission && !isLockedAndCannotBeEdited &&
                        <Editable value={url.url}
                                  onChange={onMappingChanged}/>}
                </TableCell>
                <TableCell width="120px">
                    <div className={classes.chipContainer}>
                        {url.default ? <Chip color="accent"
                                             label="Canonical"
                                             data-sel-role="canonical-badge"
                                             className={clsx({[classes.chipWithMargin]: isMarkedForDeletion || isLockedAndCannotBeEdited})}/> : null}
                        {isMarkedForDeletion || isLockedAndCannotBeEdited ?
                            <Chip color="danger"
                                  title={lockedDetails?.message}
                                  data-sel-role={`${lockedDetails?.type}-badge`}
                                  icon={<Lock/>}/> : null}
                    </div>
                </TableCell>
                <TableCell className={clsx(classes.languageContainer, {[classes.inactive]: !url.active})} width="90px">
                    <LanguageMenu
                        isDisabled={Boolean(isMarkedForDeletion) || Boolean(!hasWritePermission) || Boolean(isLockedAndCannotBeEdited)}
                        languageCode={urlPair.default.language}
                        onLanguageSelected={languageCode => updateVanity({
                            urlPair: urlPair,
                            language: languageCode
                        }, client, t)}/>
                </TableCell>
                <TableCell width="40px" align="center" padding="none">
                    <span>
                        <DisplayAction
                            disabled={!hasWritePermission}
                            path={urlPair.default.path}
                            language={urlPair.default.language}
                            urlPair={urlPair}
                            urlPairs={[urlPair]}
                            isDefaultMapping={url.default}
                            actionKey="vanityListMenu"
                            render={ButtonRendererNoLabel}
                            loading={() => (<Loader size="small"/>)}
                            buttonProps={{variant: 'ghost', size: 'big'}}/>
                    </span>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow key={urlPair.uuid} className={clsx(classes.vanityUrl, classes.tableRow)}>
            <TableCell colSpan={6} className={classes.missingDefault}>
                <Typography>
                    {urlPair.live && urlPair.live.editNode ? (
                        t('label.mappings.movedDefault', {page: urlPair.live.editNode.targetNode.displayName})
                    ) : ''}
                </Typography>
            </TableCell>
        </TableRow>
    );
};

DefaultRow.propTypes = {
    hasWritePermission: PropTypes.bool.isRequired,
    urlPair: PropTypes.object.isRequired,
    isCheckboxesDisplayed: PropTypes.bool.isRequired,
    selection: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isOpenCardMode: PropTypes.bool.isRequired,
    onChangeSelection: PropTypes.func.isRequired
};
