import React from 'react';
import * as _ from 'lodash';
import {Checkbox, Paper, Table, TableBody} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
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
    actions,
    contentUuid,
    isOpenCardMode
}) => {
    const {t} = useTranslation('site-settings-seo');
    const {languages} = useVanityUrlContext();
    let urlPairs = vanityUrls.filter(vanityUrl => vanityUrl.default);

    let allCheckboxChecked = false;
    let allCheckboxIndeterminate = false;
    if (urlPairs.length > 0) {
        allCheckboxChecked = _.differenceBy(urlPairs, selection, 'uuid').length === 0;
        allCheckboxIndeterminate = !allCheckboxChecked && _.intersectionBy(urlPairs, selection, 'uuid').length > 0;
    }

    let checkboxesDisplayed = (allCheckboxChecked || allCheckboxIndeterminate);

    return (
        <div>
            {!isOpenCardMode && urlPairs.length > 0 ? (
                <div className={classes.allCheckbox}>
                    <Checkbox
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
                <Table className={classes.table}>
                    <TableBody data-vud-table-body-default={contentUuid}>
                        {vanityUrls.map(urlPair => (
                            <DefaultRow key={urlPair.uuid}
                                        classes={classes}
                                        urlPair={urlPair}
                                        isOpenCardMode={isOpenCardMode}
                                        isCheckboxesDisplayed={checkboxesDisplayed}
                                        isExpanded={isExpanded}
                                        actions={actions}
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
    vanityUrls: PropTypes.array.isRequired,
    contentUuid: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isOpenCardMode: PropTypes.bool.isRequired,
    onChangeSelection: PropTypes.func.isRequired
};
