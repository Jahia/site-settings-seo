import React from 'react';
import * as _ from 'lodash';
import {Checkbox, Switch, TableCell, TableRow} from '@material-ui/core';
import {Editable} from '../Editable';
import classes from './DefaultRow.scss';
import {Chip, Loader, Lock, Typography} from '@jahia/moonstone';
import {LanguageMenu} from '../LanguageMenu';
import {DisplayAction} from '@jahia/ui-extender';

let ButtonRendererNoLabel;
import('@jahia/content-editor').then(v => {
    ButtonRendererNoLabel = v.ButtonRendererNoLabel;
}).catch(e => console.warn('Error loading ButtonRenderer from content-editor', e));
import {ButtonRendererNoLabel as LocalButtonRendererNoLabel} from '../Renderer/getButtonRenderer';
import {useTranslation} from 'react-i18next';
import * as PropTypes from 'prop-types';
import clsx from 'clsx';

export const DefaultRow = ({
    urlPair,
    isCheckboxesDisplayed,
    onChangeSelection,
    isExpanded,
    actions,
    selection,
    isOpenCardMode
}) => {
    const {t} = useTranslation('site-settings-seo');

    const onMappingChanged = (value, onSuccess, onError) => {
        actions.updateVanity.call({urlPair: urlPair, url: value}, onSuccess, onError);
    };

    const url = urlPair.default;
    const selected = Boolean(_.find(selection, p => p.uuid === urlPair.uuid));

    if (url) {
        const statuses = [
            {key: 'PUBLISHED', value: classes.isPublished},
            {key: 'MODIFIED', value: classes.toBePublished},
            {key: 'NOT_PUBLISHED', value: classes.toBePublished},
            {key: 'MARKED_FOR_DELETION', value: classes.isMarkedForDeletion}
        ];

        const isMarkedForDeletion = url.publicationInfo.publicationStatus === 'MARKED_FOR_DELETION' || url.mixinTypes.find(mixin => mixin.name === 'jmix:markedForDeletion');
        return (
            <TableRow key={urlPair.uuid}
                      hover
                      className={clsx(classes.tableRow, {[classes.inactive]: !url.active})}
                      classes={{
                          root: classes.vanityUrl,
                          hover: (statuses.find(status => status.key === url.publicationInfo.publicationStatus).value)
                      }}
                      data-vud-url={url.url}
            >
                <TableCell
                    className={(isCheckboxesDisplayed ? (isExpanded ? '' : classes.hidden) : (classes.hiddenOnHover)) + ' ' + classes.checkboxLeft}
                    width="3%"
                >
                    {!isOpenCardMode && <Checkbox checked={selected}
                                                  onClick={event => {
                                                      event.stopPropagation();
                                                  }}
                                                  onChange={(event, checked) => onChangeSelection(checked, [urlPair])}/>}
                </TableCell>
                <TableCell width="55px">
                    <Switch classes={{switchBase: classes.switchBase, checked: classes.switchChecked}}
                            checked={url.active}
                            disabled={Boolean(isMarkedForDeletion)}
                            data-vud-role="action-active"
                            onClick={event => {
                                event.stopPropagation();
                            }}
                            onChange={event => actions.updateVanity.call({urlPair: urlPair, active: event.target.checked}, event)}/>
                </TableCell>
                <TableCell className={clsx(classes.tableCellTextInput, {[classes.inactive]: !url.active})} width="100%">
                    {isMarkedForDeletion &&
                        <Typography data-vud-role="url"
                                    className={classes.deletedUrl}
                        >
                            {url.url}
                        </Typography>}
                    {!isMarkedForDeletion && <Editable value={url.url}
                                                       onChange={onMappingChanged}/>}
                </TableCell>
                <TableCell width="120px">
                    <div className={classes.chipContainer}>
                        {url.default ? <Chip color="accent" label="Canonical"/> : null}
                        {isMarkedForDeletion ? <Chip color="danger" icon={<Lock/>}/> : null}
                    </div>
                </TableCell>
                <TableCell className={clsx(classes.languageContainer, {[classes.inactive]: !url.active})} width="90px">
                    <LanguageMenu isDisabled={Boolean(isMarkedForDeletion)}
                                  languageCode={urlPair.default.language}
                                  onLanguageSelected={languageCode => actions.updateVanity.call({
                                      urlPair: urlPair,
                                      language: languageCode
                                  })}/>
                </TableCell>
                <TableCell width="40px" align="center" padding="none">
                    <span>
                        <DisplayAction
                            path={urlPair.default.path}
                            urlPair={urlPair}
                            urlPairs={[urlPair]}
                            actions={actions}
                            isDefaultMapping={url.default}
                            actionKey="vanityListMenu"
                            render={ButtonRendererNoLabel || LocalButtonRendererNoLabel}
                            loading={() => (<Loader size="small"/>)}
                            buttonProps={{variant: 'ghost', size: 'big'}}/>
                    </span>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow key={urlPair.uuid} className={clsx(classes.vanityUrl, classes.tableRow)}>
            <TableCell colSpan={7} className={classes.missingDefault}>
                {urlPair.live && urlPair.live.editNode ? (
                        t('label.mappings.movedDefault', {page: urlPair.live.editNode.targetNode.displayName})
                    ) : ''}
            </TableCell>
        </TableRow>
    );
};

DefaultRow.propTypes = {
    urlPair: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isCheckboxesDisplayed: PropTypes.bool.isRequired,
    selection: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isOpenCardMode: PropTypes.bool.isRequired,
    onChangeSelection: PropTypes.func.isRequired
};