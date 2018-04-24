import React from 'react';
import {translate} from 'react-i18next';

import {VanityUrlListDefault, VanityUrlListLive} from './VanityUrlList';
import {AddVanityUrl} from "./AddVanityUrl";

import {Button, IconButton, Collapse, Grid, ListItem, ListItemIcon, ListItemText, Paper, Typography, withStyles} from 'material-ui';

import {KeyboardArrowDown, KeyboardArrowRight} from 'material-ui-icons';

const styles = theme => ({
    root: {
        margin: theme.spacing.unit
    },
    filterMatchInfo: {
        margin: theme.spacing.unit
    },
    vanityUrlLists: {
        paddingLeft: 64,
        padding: 16,
    },
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
        this.setState((state) => ({
            expanded: !state.expanded
        }));
    };

    handleFilterSwitchClick(e) {
        e.stopPropagation();
        this.setState((state) => ({
            localFilteringEnabled: !state.localFilteringEnabled
        }));
    };

    render() {

        const { content, filterText, classes, t, onChangeSelection, selection, actions, languages } = this.props;

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
                <Button onClick={(e) => this.handleFilterSwitchClick(e)}>
                    {filterSwitchButtonLabel}
                </Button>
            );
        }

        let vanityUrls = this.state.localFilteringEnabled || !content.allUrls ? content.urls : content.allUrls
        return (
            <div className={this.props.classes.root}>
                <Paper elevation={1}>
                    <ListItem onClick={() => this.handleExpandCollapseClick()} >

                        {this.state.expanded ? <KeyboardArrowDown color={'secondary'} /> : <KeyboardArrowRight color={'secondary'}/>}

                        <ListItemText inset primary={content.displayName} secondary={content.path} data-vud-content-uuid={content.uuid}/>
                        {filterMatchInfo}
                        {localFilterSwitch}
                        {this.state.expanded ? <IconButton aria-label={actions.addAction.className} onClick={(event) => {
                            event.stopPropagation();
                            actions.addAction.call(content.path, languages);
                        }}>
                            {actions.addAction.body}
                            {actions.addAction.buttonIcon}
                        </IconButton>: ''}

                    </ListItem>
                    <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                        <Grid container spacing={24} className={classes.vanityUrlLists}>
                            <Grid item xs={12} lg={6}>
                                <VanityUrlListDefault onChangeSelection={onChangeSelection} selection={selection} vanityUrls={vanityUrls} filterText={filterText} expanded={this.state.expanded} actions={actions} languages={languages} contentUuid={content.uuid}/>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <VanityUrlListLive vanityUrls={vanityUrls} filterText={filterText} actions={actions} contentUuid={content.uuid}/>
                            </Grid>
                        </Grid>
                    </Collapse>
                </Paper>
            </div>
        );
    }
}

VanityUrlEnabledContent = withStyles(styles)(translate('site-settings-seo')(VanityUrlEnabledContent));

export {VanityUrlEnabledContent};
