import React, {useState} from 'react';
import {withTranslation} from 'react-i18next';
import {
    Checkbox,
    IconButton,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles,
    Menu,
    MenuItem
} from '@material-ui/core';
import {LanguageMenu} from './LanguageMenu';
import * as _ from 'lodash';
import {Editable} from './Editable';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {flowRight as compose} from 'lodash';
import {withNotifications} from '@jahia/react-material';
import {Typography, Button, MoreVert, Chip, SwapHoriz, Delete, Publish, Star} from '@jahia/moonstone';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';

const styles = theme => ({
    boxTitle: {
        padding: theme.spacing.unit
    },
    vanityUrl: {
        '&:hover $hiddenOnHover': {
            transition: ['opacity', '0.25s'],
            opacity: 1
        },
        '& td': {
            padding: '7px 0'
        }
    },
    vanityUrlLive: {
        '& td': {
            padding: '7px 0'
        }
    },
    hidden: {
        opacity: 0
    },
    hiddenOnHover: {
        opacity: 0,
        transition: ['opacity', '0.25s']
    },
    table: {
        color: theme.palette.text.primary,
        tableLayout: 'fixed'
    },
    tableCellTextInput: {
        background: 'transparent',
        width: '100%',
        '& > div': {
        }
    },
    tableRow: {
        height: '66px',
        '&:hover $editableText': {
            marginRight: '78px'
        },
        '&:hover $vanityURLText:before': {
            background: '#f7f7f7'
        },
        '&:hover $vanityURLText:after': {
            background: '#f7f7f7'
        }
    },
    tableRowLive: {
        height: '66px',
        '&:hover': {
            backgroundColor: 'inherit'
        }
    },
    checkboxLeft: {
        marginLeft: '-32px',
        marginTop: '2px',
        position: 'absolute',
        border: '0',
        color: theme.palette.text.primary
    },
    languageContainer: {
        paddingRight: '10px'
    },
    liveVanityUrl: {
        paddingLeft: '14px!important'
    },
    liveLanguage: {
        color: '#676767',
        width: '50px'
    },
    inactive: {
        '& $languageContainer': {
            opacity: '0.5',
            '&:hover': {
                opacity: '1'
            }
        },
        '& $liveLanguage': {
            color: '#B2B2B2'
        },
        '& $vanityURLText': {
            color: '#B2B2B2'
        }
    },
    missingDefault: {
        fontStyle: 'italic',
        fontWeight: '100',
        color: '#B2B2B2',
        fontSize: '0.8125rem',
        paddingLeft: '22px!important',
        boxShadow: 'inset 7px 0px 0 0 #bab7b7'
    },
    missingDefaultCounterpart: {
        boxShadow: 'inset 7px 0px 0 0 ' + 'red',
        color: 'whitesmoke',
        '& td': {
            borderBottomColor: '#f66'
        },
        background: '#f66',
        '&:hover': {
            background: '#f66!important'
        },
        '&:hover $vanityURLText:before': {
            background: '#f66'
        },
        '&:hover $vanityURLText:after': {
            background: '#f66'
        },
        '& $vanityURLText': {
            color: 'whitesmoke',
            '&:before': {
                background: '#f66'
            },
            '&:after': {
                background: '#f66'
            }
        },
        '& $liveLanguage': {
            color: 'whitesmoke'
        },
        '& $highlightTextContainer': {
            color: 'whitesmoke'
        }
    },
    toBePublished: {
        boxShadow: 'inset 7px 0px 0 0 ' + '#FB9926',
        color: 'rgb(228, 174, 28)'
    },
    isPublished: {
        boxShadow: 'inset 7px 0px 0 0 #08D000',
        color: 'rgb(60, 149, 66)'
    },
    highlightText: {
        backgroundColor: 'yellow',
        color: '#212121'
    },
    highlightTextContainer: {
	    padding: '3px 6px 1px',
	    overflow: 'hidden',
	    position: 'relative',
	    fontSize: '0.8rem',
	    maxHeight: '42px',
	    wordBreak: 'break-all',
	    lineHeight: '21px',
        display: 'block',
        '&:hover': {
            marginRight: '78px'
        }
    },
    moveAction: {
        color: '#212121',
        opacity: '0.6',
        '&:hover': {
            background: 'transparent',
            opacity: '1'
        }
    },
    deleteAction: {
        color: '##E0182D'
    },
    actionButton: {
        width: '38px',
        '& button': {
            opacity: '0.9',
            '&:hover': {
                background: 'transparent',
                opacity: '1'
            }
        }
    },
    publish: {
        color: '#212121',
        marginRight: '10px',
        width: '28px',
        opacity: '0.6',
        '&:hover': {
            background: 'transparent',
            opacity: '1'
        }
    },
    allCheckbox: {
        position: 'absolute',
        marginLeft: '-31px',
        marginTop: '-18px',
        '&:hover': {
            transition: ['opacity', '0.25s'],
            opacity: 1
        }
    },
    tableTitle: {
        marginBottom: '8px',
        fontSize: 18
    },
    inactiveRow: {
        border: '10px solid red'
    },
    vanityURLText: {
        lineHeight: '21px',
        maxHeight: '42px',
        overflow: 'hidden',
        position: 'relative',
        wordBreak: 'break-all',
        padding: '3px 6px 1px',
        fontSize: '0.8rem',
        color: '#212121',
        fontFamily: 'Nunito, "Nunito Sans"'
    },
    vanityURLTextLive: {
        lineHeight: '21px',
        maxHeight: '42px',
        overflow: 'hidden',
        position: 'relative',
        wordBreak: 'break-all',
        padding: '3px 6px 1px',
        fontSize: '0.8rem',
        color: '#B2B2B2',
        fontFamily: 'Nunito, "Nunito Sans"'
    },
    editableText: {
        '&:hover': {
            boxShadow: 'inset 1px 1px 0 0 #d9d7d7, inset -1px -1px 0 0 #d9d7d7',
            cursor: 'text',
            background: 'white'
        },
        '&:hover:before': {
            background: '#FFF!important'
        },
        '&:hover:after': {
            background: '#FFF!important'
        }
    },
    vanityGroupPaper: {
        boxShadow: '1px 1px 2px 0px rgba(0, 0, 0, 0.09)',
        border: '1px solid #d5d5d5',
        borderBottom: 'none',
        borderRadius: '0px'
    },
    noShadowBox: {
        boxShadow: 'none'
    },
    noPublishedVanityUrlText: {
        color: 'rgba(41, 49, 54, 0.6)',
        paddingTop: '12px'
    },
    editLine: {
        backgroundColor: '#F7F7F7!important',

        '& $tableCellTextInput > div > div': {
            background: 'white!important'
            // BoxShadow: 'inset 1px 1px 1px 0 rgba(38, 38, 38, 0.3)'
        }
    },
    switchBase: {
        width: 'unset'
    },
    switchChecked: {
        width: 'inherit'
    },
    menuAction: {
        '&:hover': {
            background: 'transparent !important'
        }
    },
    colorWhite: {
        color: 'white'
    },
    popoverRoot: {
        zIndex: 2000
    }
});

const DefaultRow = ({classes, urlPair, checkboxesDisplayed, onChangeSelection, expanded, actions, languages, selection, t, openCardMode}) => {
    const [anchor, setAnchor] = useState(null);
    const [editLine, setEditLine] = useState(null);

    const openMenu = event => {
        setAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setAnchor(null);
    };

    const onMappingChanged = (value, onSuccess, onError) => {
        actions.updateVanity.call({urlPair: urlPair, url: value}, onSuccess, onError);
    };

    const url = urlPair.default;
    const selected = Boolean(_.find(selection, p => p.uuid === urlPair.uuid));

    if (url) {
        const classInactive = (url.active ? '' : classes.inactive);
        const isPublished = url.publicationInfo.publicationStatus === 'PUBLISHED';

        return (
            <TableRow key={urlPair.uuid}
                      hover
                      className={
                          classes.tableRow + ' ' +
                          classInactive + ' ' +
                          (editLine === urlPair.uuid ? classes.editLine : '')
                      }
                      classes={{
                          root: classes.vanityUrl,
                          hover: (isPublished ? classes.isPublished : classes.toBePublished)
                      }}
                      data-vud-url={url.url}
            >
                <TableCell className={(checkboxesDisplayed ? (expanded ? '' : classes.hidden) : (classes.hiddenOnHover)) + ' ' + classes.checkboxLeft} width="3%">
                    {!openCardMode && <Checkbox checked={selected}
                                                onClick={event => {
                                                    event.stopPropagation();
                                                }}
                                                onChange={(event, checked) => onChangeSelection(checked, [urlPair])}/>}
                </TableCell>
                <TableCell width="10%"
                           onClick={event => {
                               console.log(url);
                           }}
                >
                    <Switch classes={{switchBase: classes.switchBase, checked: classes.switchChecked}}
                            checked={url.active}
                            data-vud-role="action-active"
                            onClick={event => {
                                event.stopPropagation();
                            }}
                            onChange={event => actions.updateVanity.call({urlPair: urlPair, active: event.target.checked}, event)}/>
                </TableCell>
                <TableCell className={classInactive + ' ' + classes.tableCellTextInput} width="50%">
                    <Editable value={url.url}
                              render={props => <Typography data-vud-role="url" className={classes.vanityURLText + ' ' + classes.editableText}>{props.value}</Typography>}
                              onEdit={() => setEditLine(urlPair.uuid)}
                              onChange={(value, onSuccess, onError) => onMappingChanged(value, onSuccess, onError)}/>
                </TableCell>
                <TableCell width="20%">
                    {url.default ? <Chip color="accent" label="Canonical"/> : null}
                </TableCell>
                <TableCell className={classInactive + ' ' + classes.languageContainer} width="10%">
                    <LanguageMenu languageCode={urlPair.default.language} languages={languages} onLanguageSelected={languageCode => actions.updateVanity.call({urlPair: urlPair, language: languageCode})}/>
                </TableCell>
                <TableCell width="7%" align="center" padding="none">
                    <span>
                        <Button variant="ghost" icon={<MoreVert/>} onClick={openMenu}/>
                        <Menu
                            keepMounted
                            ModalClasses={{root: classes.popoverRoot}}
                            anchorEl={anchor}
                            open={Boolean(anchor)}
                            onClose={closeMenu}
                        >
                            <MenuItem onClick={e => {
closeMenu(); actions.updateVanity.call({urlPair: urlPair, defaultMapping: !url.default}, e);
}}
                            >
                                {!url.default ? <Button className={classes.menuAction} variant="ghost" label={t('label.actions.canonical.set')} icon={<Star/>} size="small" onClick={() => {}}/> :
                                <Button className={classes.menuAction} variant="ghost" label={t('label.actions.canonical.unset')} icon={<Star/>} size="small" onClick={() => {}}/>}
                            </MenuItem>
                            <MenuItem onClick={e => {
closeMenu(); actions.moveAction.call([urlPair], e);
}}
                            >
                                <Button className={classes.menuAction} variant="ghost" label={t('label.actions.move')} icon={<SwapHoriz/>} size="small" onClick={() => {}}/>
                            </MenuItem>
                            { !isPublished && <MenuItem onClick={e => {
closeMenu(); actions.publishAction.call([urlPair], e);
}}
                                              >
                                <Button className={classes.menuAction} variant="ghost" label={t('label.actions.publish')} icon={<Publish/>} size="small" onClick={() => {}}/>
                            </MenuItem>}
                            <MenuItem onClick={e => {
closeMenu(); actions.deleteAction.call([urlPair], e);
}}
                            >
                                <Button className={classes.menuAction} variant="ghost" color="danger" label={t('label.actions.delete')} icon={<Delete/>} size="small" onClick={() => {}}/>
                            </MenuItem>
                        </Menu>
                    </span>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow key={urlPair.uuid} className={classes.vanityUrl + ' ' + classes.tableRow}>
            <TableCell colSpan={7} className={classes.missingDefault}>
                {urlPair.live && urlPair.live.editNode ? (
                        t('label.mappings.movedDefault', {page: urlPair.live.editNode.targetNode.displayName})
                    ) :
                    t('label.mappings.missingDefault', {vanityUrl: urlPair.live.url})}
            </TableCell>
        </TableRow>
    );
};

class VanityUrlListDefault extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {vanityUrls, classes, t, selection, onChangeSelection, expanded, actions, languages, contentUuid, openCardMode} = this.props;
        let urlPairs = _.filter(vanityUrls, urlPair => urlPair.default);

        let allCheckboxChecked = false;
        let allCheckboxIndeterminate = false;
        if (urlPairs.length > 0) {
            allCheckboxChecked = _.differenceBy(urlPairs, selection, 'uuid').length === 0;
            allCheckboxIndeterminate = !allCheckboxChecked && _.intersectionBy(urlPairs, selection, 'uuid').length > 0;
        }

        let checkboxesDisplayed = (allCheckboxChecked || allCheckboxIndeterminate);

        return (
            <div>
                <div>
                    {!openCardMode && urlPairs.length > 0 ? (
                        <Checkbox className={(checkboxesDisplayed ? (expanded ? '' : classes.hidden) : (classes.hiddenOnHover)) + ' ' + classes.allCheckbox}
                                  checked={allCheckboxChecked}
                                  indeterminate={allCheckboxIndeterminate}
                                  data-vud-checkbox-all={contentUuid}
                                  onChange={(event, checked) => onChangeSelection(checked && !allCheckboxIndeterminate, urlPairs)}
                        />
                    ) : ''}
                    <Typography variant="subheading" className={classes.tableTitle} weight="bold">
                        {t('label.mappings.default')}
                    </Typography>
                </div>
                <Paper elevation={2} className={classes.vanityGroupPaper}>
                    <Table className={classes.table}>
                        <TableBody data-vud-table-body-default={contentUuid}>
                            {vanityUrls.map(urlPair => (
                                <DefaultRow key={urlPair.uuid}
                                            classes={classes}
                                            urlPair={urlPair}
                                            openCardMode={openCardMode}
                                            checkboxesDisplayed={checkboxesDisplayed}
                                            t={t}
                                            expanded={expanded}
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
    }
}

class VanityUrlListLive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deletionUrls: []
        };
    }

    render() {
        let {vanityUrls, classes, t, actions, contentUuid, workspace} = this.props;
        let deletedUrls = _.filter(vanityUrls, urlPair => urlPair.live && !urlPair.live.editNode);

        // Get all vanity with default not published
        let defaultNotPublished = _.map(_.filter(vanityUrls, urlPair => urlPair.live && urlPair.default && !urlPair.default.default && urlPair.live.default), urlPair => urlPair.live);
        // Get all languages of live  vanity set as default
        let defaultPerLanguages = _.filter(_.map(vanityUrls, urlPair => urlPair.live && urlPair.live.default ? urlPair.live.language : null));
        // Check for multiple languages
        let multipleDefaultLang = (_.filter(defaultPerLanguages, function (value, index, iter) {
            return _.includes(iter, value, index + 1);
        }));
        // Filter found languages
        defaultNotPublished = _.filter(defaultNotPublished, vanity => _.includes(multipleDefaultLang, vanity.language));

        let numberOfLiveVanityUrls = vanityUrls.filter(url => url.hasOwnProperty('live')).length;

        return (
            <div>
                <div>
                    <Typography variant="subheading" classes={{caption: classes.tableTitle}} weight="bold">
                        {t('label.mappings.live')}
                    </Typography>
                </div>
                <Paper elevation={2} className={(numberOfLiveVanityUrls === 0 && workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[1].value) ? classes.noShadowBox : classes.vanityGroupPaper}>
                    {(numberOfLiveVanityUrls === 0 && workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[1].value) ?
                        <Typography variant="body" className={classes.noPublishedVanityUrlText} weight="light">
                            {t('label.noPublishedVanityUrl')}
                        </Typography> :
                        <Table className={classes.table}>
                            <TableBody data-vud-table-body-live={contentUuid}>
                                {vanityUrls.map(urlPair => {
                                    const url = urlPair.live;
                                    if (url) {
                                        const classInactive = (url.active ? '' : classes.inactive);
                                        const defaultWithMissingCounterpart = urlPair.default && !_.includes(defaultNotPublished, url);
                                        return (
                                            <TableRow key={urlPair.uuid}
                                                      hover={false}
                                                      className={classes.tableRowLive + ' ' + classes.vanityUrlLive + ' ' + (defaultWithMissingCounterpart ? '' : classes.missingDefaultCounterpart)}
                                            >
                                                <TableCell className={classInactive + ' ' + classes.liveVanityUrl} width="80%">
                                                    <Typography variant="body"
                                                                className={classes.vanityURLTextLive + ' ' + (defaultWithMissingCounterpart ? '' : classes.colorWhite)}
                                                    >{url.url}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell width="10%">
                                                    {url.default ? <Chip color="accent" label="Canonical"/> : null}
                                                </TableCell>
                                                <TableCell className={classes.liveLanguage} width="5%" align="center">
                                                    {url.language}
                                                </TableCell>
                                                <TableCell className={classInactive + ' ' + classes.actionButton} width="5%" align="center">
                                                    {url.editNode ?
                                                        (url.editNode.path !== url.path ?
                                                            <ActionButton action={actions.infoButton}
                                                                          data={url.editNode.targetNode.path ? (
                                                                              t('label.dialogs.infoButton.moveAction', {pagePath: url.editNode.targetNode.path})
                                                                          ) : ('')}/> :
                                                            _.includes(defaultNotPublished, url) ? <ActionButton action={actions.infoButton}
                                                                                                                 data={t('label.dialogs.infoButton.notPublished', {pagePath: url.editNode.targetNode.path})}/> :
                                                                '') :
                                                                <ActionButton role="action-publishDeletion"
                                                                              action={actions.publishDeleteAction}
                                                                              data={deletedUrls}/>}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    if (workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[2].value) {
                                        return (
                                            <TableRow key={urlPair.uuid} className={classes.vanityUrl + ' ' + classes.tableRowLive}>
                                                <TableCell colSpan={4} padding="none">
                                                    {/* Not published yet */}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }
                                })}
                            </TableBody>
                        </Table>}
                </Paper>
            </div>
        );
    }
}

class ActionButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {action, data, className, role} = this.props;
        return (
            <IconButton className={className}
                        aria-label={action.buttonLabel}
                        data-vud-role={role}
                        onClick={event => {
                event.stopPropagation();
                action.call(data, event);
            }}
            >
                {action.body}
                {action.buttonIcon}
            </IconButton>
        );
    }
}

VanityUrlListDefault = compose(
    withStyles(styles),
    withVanityMutationContext(),
    withNotifications(),
    withTranslation('site-settings-seo')
)(VanityUrlListDefault);

VanityUrlListLive = compose(
    withStyles(styles),
    withTranslation('site-settings-seo')
)(VanityUrlListLive);

export {VanityUrlListLive};
export {VanityUrlListDefault};
