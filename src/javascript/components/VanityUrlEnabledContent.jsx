import React from 'react';
import {withTranslation} from 'react-i18next';
import {VanityUrlListLive} from './VanityUrlList';
import {VanityUrlListDefault} from './VanityList/VanityUrlListDefault';
import {Collapse, Grid, ListItem, ListItemText, withStyles} from '@material-ui/core';
import {ChevronDown, ChevronRight, Chip, Visibility} from '@jahia/moonstone';
import {Typography, Button} from '@jahia/moonstone';
import {flowRight as compose} from 'lodash';
import AddVanityUrl from './AddVanityUrl';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRenderer} from '@jahia/jcontent';

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
        const {
            content,
            workspace,
            filterText,
            classes,
            t,
            onChangeSelection,
            selection,
            actions,
            languages,
            lang,
            openCardMode
        } = this.props;

        let filterMatchInfo = null;
        let localFilterSwitch = null;

        if (filterText && this.state.expanded) {
            filterMatchInfo = (
                <Typography variant="caption" className={classes.filterMatchInfo}>
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
                <Button className={classes.showToggle}
                        data-vud-role="button-filter-switch"
                        variant="ghost"
                        label={filterSwitchButtonLabel}
                        onClick={e => this.handleFilterSwitchClick(e)}/>
            );
        }

        let vanityUrls = this.state.localFilteringEnabled || !content.allUrls ? content.urls : content.allUrls;

        const isStaging = workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[0].value;
        const isLive = workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[1].value;
        const isBoth = workspace.value === SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[2].value;

        return (
            <>
                {
                    !openCardMode &&
                    <ListItem className={classes.vanityUrlListHeader} onClick={() => this.handleExpandCollapseClick()}>

                        {this.state.expanded ? <ChevronDown/> : <ChevronRight/>}

                        <ListItemText inset
                                      primary={content.displayName}
                                      secondary={content.path}
                                      className={classes.vanityUrlListHeaderText}
                                      data-vud-role="content-title"/>
                        {content.hasWritePermission ? null : <Chip data-sel-role="read-only-badge"
                                                             label={t('label.readOnly')}
                                                             icon={<Visibility/>}
                                                             color="warning"
                        />}
                        {this.state.expanded && content.hasWritePermission &&
                            <DisplayAction actionKey="publishAllVanity"
                                           render={ButtonRenderer}
                                           nodeData={content}/>}

                        {filterMatchInfo}
                        {localFilterSwitch}
                    </ListItem>
                }
                <Collapse unmountOnExit in={this.state.expanded || openCardMode} timeout="auto">
                    <Grid container spacing={16} className={classes.vanityUrlLists}>
                        {(isStaging || isBoth) &&
                            <Grid item xs={isStaging ? 12 : 6}>
                                <VanityUrlListDefault selection={selection}
                                                      vanityUrls={vanityUrls}
                                                      filterText={filterText}
                                                      isExpanded={this.state.expanded}
                                                      actions={actions}
                                                      languages={languages}
                                                      contentUuid={content.uuid}
                                                      isOpenCardMode={openCardMode}
                                                      hasWritePermission={content.hasWritePermission}
                                                      onChangeSelection={onChangeSelection}/>
                            </Grid>}
                        {(isLive || isBoth) &&
                            <Grid item xs={isLive ? 12 : 6}>
                                <VanityUrlListLive vanityUrls={vanityUrls}
                                                   filterText={filterText}
                                                   actions={actions}
                                                   contentUuid={content.uuid}
                                                   workspace={workspace}/>
                            </Grid>}
                        {(isStaging || isBoth) &&
                            <Grid item xs={12}>
                                <AddVanityUrl path={content.path} lang={lang} hasWritePermission={content.hasWritePermission}/>
                            </Grid>}
                    </Grid>
                </Collapse>
            </>
        );
    }
}

// eslint-disable-next-line no-class-assign
VanityUrlEnabledContent = compose(
    withStyles(styles),
    withTranslation('site-settings-seo'))
(VanityUrlEnabledContent);

export {VanityUrlEnabledContent};
