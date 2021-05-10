import React from 'react';
import {withTranslation} from 'react-i18next';
import {VanityUrlListDefault, VanityUrlListLive} from './VanityUrlList';
import {Collapse, Grid, ListItem, ListItemText, Paper, withStyles} from '@material-ui/core';
import {KeyboardArrowDown, KeyboardArrowRight} from '@material-ui/icons';
import {Typography, Button} from '@jahia/moonstone';
import {flowRight as compose} from 'lodash';
import AddVanityUrl from './AddVanityUrl';

const styles = theme => ({
    root: {
        margin: theme.spacing.unit
    },
    filterMatchInfo: {
        margin: theme.spacing.unit
    },
    vanityUrlLists: {
        paddingLeft: '45px',
        paddingTop: '12px',
        padding: '26px'
    },
    vanityUrlListHeader: {
        paddingLeft: '13px',
        paddingRight: '10px'
    },
    vanityUrlListHeaderText: {
        paddingLeft: '8px'
    },
    showToggle: {
        color: '#ffffff',
	    background: '#757575',
	    fontSize: '10px',
	    minHeight: 'auto',
	    minWidth: 'auto',
	    padding: '5px',
	    borderRadius: '0',
        '&:hover': {
            backgroundColor: '#595858'
        }
    }
});

class VanityUrlEnabledContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            localFilteringEnabled: true
        };
    }

    handleExpandCollapseClick() {
        this.setState(state => ({
            expanded: !state.expanded
        }));
    }

    handleFilterSwitchClick(e) {
        e.stopPropagation();
        this.setState(state => ({
            localFilteringEnabled: !state.localFilteringEnabled
        }));
    }

    render() {
        const {content, filterText, classes, t, onChangeSelection, selection, actions, languages, lang} = this.props;

        let filterMatchInfo = null;
        let localFilterSwitch = null;

        if (filterText && this.state.expanded) {
            filterMatchInfo = (
                <Typography variant="caption" classes={{caption: classes.filterMatchInfo}}>
                    {t('label.filterMatch', {count: content.urls.length, totalCount: content.allUrls.length})}
                </Typography>
            );

            let filterSwitchButtonLabel = null;
            if (this.state.localFilteringEnabled) {
                filterSwitchButtonLabel = t('label.localFilter.switchOff');
            } else {
                filterSwitchButtonLabel = t('label.localFilter.switchOn');
            }

            localFilterSwitch = (
                <Button className={classes.showToggle} data-vud-role="button-filter-switch" variant="ghost" label={filterSwitchButtonLabel} onClick={e => this.handleFilterSwitchClick(e)}/>
            );
        }

        let vanityUrls = this.state.localFilteringEnabled || !content.allUrls ? content.urls : content.allUrls;
        return (
            <div className={this.props.classes.root} data-vud-content-uuid={content.uuid}>
                <Paper elevation={1}>
                    <ListItem className={classes.vanityUrlListHeader} onClick={() => this.handleExpandCollapseClick()}>

                        {this.state.expanded ? <KeyboardArrowDown/> : <KeyboardArrowRight/>}

                        <ListItemText inset primary={content.displayName} secondary={content.path} className={classes.vanityUrlListHeaderText} data-vud-role="content-title"/>
                        {filterMatchInfo}
                        {localFilterSwitch}
                    </ListItem>
                    <Collapse unmountOnExit in={this.state.expanded} timeout="auto">
                        <Grid container spacing={16} className={classes.vanityUrlLists}>
                            <Grid item xs={6}>
                                <VanityUrlListDefault selection={selection} vanityUrls={vanityUrls} filterText={filterText} expanded={this.state.expanded} actions={actions} languages={languages} contentUuid={content.uuid} onChangeSelection={onChangeSelection}/>
                            </Grid>
                            <Grid item xs={6}>
                                <VanityUrlListLive vanityUrls={vanityUrls} filterText={filterText} actions={actions} contentUuid={content.uuid}/>
                            </Grid>
                            <Grid item xs={12}>
                                <AddVanityUrl path={content.path} lang={lang} availableLanguages={languages}/>
                            </Grid>
                        </Grid>
                    </Collapse>
                </Paper>
            </div>
        );
    }
}

VanityUrlEnabledContent = compose(
    withStyles(styles),
    withTranslation('site-settings-seo'))
(VanityUrlEnabledContent);

export {VanityUrlEnabledContent};
