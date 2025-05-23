import React from 'react';
import {Checkbox, Paper, Table, TableBody, TableRow} from '@material-ui/core';
import {TableHead, TableHeadCell, Typography} from '@jahia/moonstone';
import classes from './VanityUrlListDefault.scss';
import {useTranslation} from 'react-i18next';
import {DefaultRow} from './DefaultRow';
import * as PropTypes from 'prop-types';
import {useVanityUrlContext} from '../Context/VanityUrl.context';

export const VanityUrlListDefault = ({
    vanityUrls,
    selection,
    onChangeSelection,
    isExpanded,
    contentUuid,
    isOpenCardMode,
    hasWritePermission
}) => {
    const {t} = useTranslation('site-settings-seo');
    const {languages} = useVanityUrlContext();
    let urlPairs = vanityUrls.filter(vanityUrl => vanityUrl.default);

    let allCheckboxChecked = false;
    let allCheckboxIndeterminate = false;
    if (urlPairs.length > 0) {
        const uuids = selection.map(selected => selected.uuid);
        allCheckboxChecked = urlPairs.filter(urlPair => !uuids.includes(urlPair.uuid)).length === 0;
        allCheckboxIndeterminate = !allCheckboxChecked && urlPairs.some(urlPair => uuids.includes(urlPair.uuid));
    }

    let checkboxesDisplayed = (allCheckboxChecked || allCheckboxIndeterminate) && hasWritePermission;

    return (
        <div>
            {!isOpenCardMode && urlPairs.length > 0 ? (
                <div className={classes.allCheckbox}>
                    <Checkbox
                        disabled={!hasWritePermission}
                        className={(checkboxesDisplayed ? (isExpanded ? '' : classes.hidden) : (classes.hiddenOnHover))}
                        checked={allCheckboxChecked}
                        indeterminate={allCheckboxIndeterminate}
                        data-vud-checkbox-all={contentUuid}
                        onChange={(event, checked) => onChangeSelection(checked && !allCheckboxIndeterminate, urlPairs)}
                    />
                </div>
            ) : <></>}
            <Typography variant="subheading" className={classes.tableTitle} weight="bold">
                {t('label.mappings.default')}
            </Typography>
            <Paper elevation={2} className={classes.vanityGroupPaper}>
                <Table className={classes.table} data-sel-role="vanity-url-list">
                    <TableHead>
                        <TableRow className={classes.theadRow}>
                            <TableHeadCell/>
                            <TableHeadCell width="55px"/>
                            <TableHeadCell width="100%"/>
                            <TableHeadCell width="120px"/>
                            <TableHeadCell width="90px"/>
                            <TableHeadCell width="40px"/>
                        </TableRow>
                    </TableHead>
                    <TableBody data-vud-table-body-default={contentUuid}>
                        {vanityUrls.map(urlPair => (
                            <DefaultRow key={urlPair.uuid}
                                        hasWritePermission={hasWritePermission}
                                        classes={classes}
                                        urlPair={urlPair}
                                        isOpenCardMode={isOpenCardMode}
                                        isCheckboxesDisplayed={checkboxesDisplayed}
                                        isExpanded={isExpanded}
                                        languages={languages}
                                        selection={selection}
                                        onChangeSelection={onChangeSelection}/>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </div>
    );
};

VanityUrlListDefault.propTypes = {
    hasWritePermission: PropTypes.bool.isRequired,
    vanityUrls: PropTypes.array.isRequired,
    contentUuid: PropTypes.string.isRequired,
    selection: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isOpenCardMode: PropTypes.bool.isRequired,
    onChangeSelection: PropTypes.func.isRequired
};
