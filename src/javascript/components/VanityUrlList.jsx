import React from 'react';
import {withTranslation} from 'react-i18next';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles
} from '@material-ui/core';
import * as _ from 'lodash';
import {flowRight as compose} from 'lodash';
import {
    Typography,
    Chip,
    TableHeadCell,
    TableHead
} from '@jahia/moonstone';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';
import {OpenInfoDialogButton} from './VanityList/live/OpenInfoDialogButton';

const styles = theme => ({
    vanityUrl: {
        '& td': {
            padding: '6px'
        }
    },
    vanityUrlLive: {
        '& td': {
            padding: '6px  !important'
        }
    },
    table: {
        color: theme.palette.text.primary,
        tableLayout: 'fixed'
    },
    tableRowLive: {
        height: '66px',
        '&:hover': {
            backgroundColor: 'inherit'
        }
    },
    liveVanityUrl: {
        paddingLeft: '14px!important'
    },
    liveLanguage: {
        color: '#676767',
        width: '56px'
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
    missingDefaultCounterpart: {
        boxShadow: 'inset 7px 0px 0 0 red',
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
        }
    },
    actionButton: {
        width: '50px',
        '& button': {
            opacity: '0.9',
            padding: '0',
            margin: '0',
            '&:hover': {
                background: 'transparent',
                opacity: '1'
            }
        }
    },
    tableTitle: {
        marginBottom: '8px',
        fontSize: 18
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
    vanityGroupPaper: {
        boxShadow: 'none',
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
    colorWhite: {
        color: 'white'
    },
    theadRow: {
        height: '0px !important',
        pointEvents: 'none',
        border: 'unset'
    }
});

class VanityUrlListLive extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {vanityUrls, classes, t, contentUuid, workspace} = this.props;

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
                    <Typography variant="subheading" className={classes.tableTitle} weight="bold">
                        {t('label.mappings.live')}
                    </Typography>
                </div>
                <Paper elevation={2} className={(numberOfLiveVanityUrls === 0 && workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[1].value) ? classes.noShadowBox : classes.vanityGroupPaper}>
                    {(numberOfLiveVanityUrls === 0 && workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[1].value) ?
                        <Typography variant="body" className={classes.noPublishedVanityUrlText} weight="light">
                            {t('label.noPublishedVanityUrl')}
                        </Typography> :
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow className={classes.theadRow}>
                                    <TableHeadCell/>
                                    <TableHeadCell width="86px"/>
                                    <TableHeadCell width="56px"/>
                                    <TableHeadCell width="50px"/>
                                </TableRow>
                            </TableHead>
                            <TableBody data-vud-table-body-live={contentUuid}>
                                {vanityUrls.map(urlPair => {
                                    const url = urlPair.live;
                                    if (url) {
                                        const classInactive = (url.active ? '' : classes.inactive);
                                        const defaultWithMissingCounterpart = urlPair.default && !_.includes(defaultNotPublished, url);
                                        let infoMessage;
                                        if (url.editNode) {
                                            if (url.editNode.path !== url.path && url.editNode.targetNode.path) {
                                                infoMessage = t('label.dialogs.infoButton.moveAction', {pagePath: url.editNode.targetNode.path});
                                            } else if (_.includes(defaultNotPublished, url)) {
                                                infoMessage = t('label.dialogs.infoButton.notPublished', {pagePath: url.editNode.targetNode.path});
                                            }
                                        }

                                        return (
                                            <TableRow key={urlPair.uuid}
                                                      hover={false}
                                                      className={classes.tableRowLive + ' ' + classes.vanityUrlLive + ' ' + (defaultWithMissingCounterpart ? '' : classes.missingDefaultCounterpart)}
                                            >
                                                <TableCell className={classInactive + ' ' + classes.liveVanityUrl} width="100%">
                                                    <Typography variant="body"
                                                                className={classes.vanityURLTextLive + ' ' + (defaultWithMissingCounterpart ? '' : classes.colorWhite)}
                                                    >{url.url}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell width="86px">
                                                    {url.default ? <Chip color="light" label="Canonical"/> : null}
                                                </TableCell>
                                                <TableCell className={classes.liveLanguage} width="56px" align="center">
                                                    {url.language}
                                                </TableCell>
                                                <TableCell className={classInactive + ' ' + classes.actionButton} width="50px" align="center">
                                                    {infoMessage && <OpenInfoDialogButton message={infoMessage}/>}
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

VanityUrlListLive = compose(
    withStyles(styles),
    withTranslation('site-settings-seo')
)(VanityUrlListLive);

export {VanityUrlListLive};
