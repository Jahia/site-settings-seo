import React from 'react';
import {translate} from 'react-i18next';
import {Checkbox, Paper, Switch, Table, TableBody, TableCell, TableRow, Typography, withStyles} from 'material-ui';
import {Star, StarBorder} from 'material-ui-icons';
import {VanityUrlActions} from './VanityUrlActions';

const styles = (theme) => ({
    boxTitle: {
        padding: theme.spacing.unit
    },
    vanityUrl: {
        '&:hover $hiddenOnHover': {
            transition: ["opacity","0.25s"],
            opacity:1
        },
        height: '52px'
    },
    hidden: {
        opacity:0
    },
    hiddenOnHover: {
        opacity:0,
        transition: ["opacity","0.25s"],
    },
    checkboxLeft: {
        marginLeft: '-48px',
        marginTop: '2px',
        position: 'absolute',
        border: '0'
    },
    inactive: {
        color: theme.palette.text.disabled
    },
    missingDefault: {
        color: theme.palette.text.secondary
    },
    missingDefaultCounterpart: {
        backgroundColor: theme.palette.error.light
    },
    highlightText: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    }
});

class VanityUrlListDefault extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let { vanityUrls, classes, t, selection, onChangeSelection, expanded } = this.props;
        return (
            <div>
                <Typography variant="caption" classes={{caption: classes.boxTitle}} >
                    {t('label.mappings.default')}
                </Typography>
                <Paper elevation={2}>
                    <Table>
                        <TableBody>
                            {vanityUrls.map(urlPair => {
                                let url = urlPair.default;
                                let selected = selection.indexOf(urlPair.uuid) > -1;
                                if (url) {
                                    let classInactive = (url.active ? '' : classes.inactive);
                                    return (
                                        <TableRow key={urlPair.uuid} hover className={classes.vanityUrl} onClick={(event) => onChangeSelection(urlPair.uuid)}>
                                            <TableCell padding={'none'} className={(selected ? (expanded ? '' : classes.hidden) : (classes.hiddenOnHover )) + ' ' + classes.checkboxLeft}>
                                                <Checkbox onClick={(event)=>{event.stopPropagation()}} checked={selected} onChange={(event)=> onChangeSelection(urlPair.uuid)}/>
                                            </TableCell>
                                            <TableCell padding={'none'}>
                                                <Switch onClick={(event)=>{event.stopPropagation()}} onChange={(event) => console.log("chenage")} checked={url.active} />
                                            </TableCell>
                                            <TableCell padding={'none'} className={classInactive}>
                                                {this.props.filterText ? <HighlightText text={url.url} higlight={this.props.filterText}/> : url.url}
                                            </TableCell>
                                            <TableCell padding={'none'} className={classes.hiddenOnHover + ' ' + classInactive}>
                                                {selection.length === 0 && <VanityUrlActions/>}
                                            </TableCell>
                                            <TableCell padding={'none'} className={classInactive}>
                                                <Checkbox onClick={(event)=>{event.stopPropagation()}} checked={url.default} icon={<StarBorder/>} checkedIcon={<Star/>}/>
                                            </TableCell>
                                            <TableCell padding={'none'} className={classInactive}>
                                                {url.language}
                                            </TableCell>
                                        </TableRow>
                                    );
                                } else {
                                    return (
                                        <TableRow key={urlPair.uuid} className={classes.vanityUrl}>
                                            <TableCell colSpan={6} padding={'dense'} className={classes.missingDefault}>
                                                {t('label.missingDefault', {vanityUrl: urlPair.live.url})}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            })}
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
    }

    render() {
        let { vanityUrls, classes, t } = this.props;
        return (
            <div>
                <Typography variant="caption" className={classes.boxTitle} >
                    {t('label.mappings.live')}
                </Typography>
                <Paper elevation={2}>
                    <Table>
                        <TableBody>
                            {vanityUrls.map(urlPair => {
                                let url = urlPair.live;
                                if (url) {
                                    let classInactive = (url.active ? '' : classes.inactive);
                                    return (
                                        <TableRow key={urlPair.uuid} className={classes.vanityUrl + ' ' + (urlPair.default ? '' : classes.missingDefaultCounterpart)}>
                                            <TableCell padding={'dense'} className={classInactive}>
                                                {this.props.filterText ? <HighlightText text={url.url} higlight={this.props.filterText}/> : url.url}
                                            </TableCell>
                                            <TableCell padding={'none'} className={classInactive}>
                                                {url.default ? <Star color={url.active ? 'secondary' : 'disabled'}/> : ''}
                                            </TableCell>
                                            <TableCell padding={'none'} className={classInactive}>
                                                {url.language}
                                            </TableCell>
                                        </TableRow>
                                    );
                                } else {
                                    return (
                                        <TableRow key={urlPair.uuid} className={classes.vanityUrl}>
                                            <TableCell colSpan={3} padding={'none'}>
                                                {/*Not published yet */}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                            })}
                        </TableBody>
                    </Table>
                </Paper>
            </div>
        );
    }
}

class HighlightText extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        let highlight = this.props.higlight;
        let highlightEscaped = highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        let parts = this.props.text.split(new RegExp(`(${highlightEscaped})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    <span key={i} className={part.toLowerCase() === highlight.toLowerCase() ? this.props.classes.highlightText : ''}>
                        {part}
                    </span>
                )}
            </span>
        )
    }
}

VanityUrlListDefault = withStyles(styles)(translate('site-settings-seo')(VanityUrlListDefault));
VanityUrlListLive = withStyles(styles)(translate('site-settings-seo')(VanityUrlListLive));
HighlightText = withStyles(styles)(HighlightText);

export {VanityUrlListLive};
export {VanityUrlListDefault};
