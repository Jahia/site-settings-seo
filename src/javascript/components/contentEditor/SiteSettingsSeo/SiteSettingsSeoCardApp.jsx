import React from 'react';
import InfoButton from '../../InfoButton';
import Publication from '../../Publication';
import Deletion from '../../Deletion';
import PublishDeletion from '../../PublishDeletion';
import Move from '../../Move';
import {VanityUrlTableData} from '../VanityUrlTableData/VanityUrlTableData';
import {assembleWithHoc, SiteSettingsSeoApp} from '../../SiteSettingsSeoApp';
import {VanityUrlEnabledContent} from '../../VanityUrlEnabledContent';
import SiteSettingsSeoConstants from '../../SiteSettingsSeoApp.constants';
import classes from './SiteSettingsSeoCardApp.scss';
import {NoVanity} from './NoVanity';
import {Paper} from '@material-ui/core';

class SiteSettingsSeoCardApp extends SiteSettingsSeoApp {
    constructor(props) {
        super(props);
    }

    // Override
    render() {
        let {dxContext, path, t} = this.props;
        let polling = !(this.state.publication.open || this.state.deletion.open ||
            this.state.move.open || this.state.infoButton.open || this.state.publishDeletion.open);

        return (
            <div>
                <VanityUrlTableData
                    {...this.state.loadParams}
                    path={path}
                    lang={dxContext.lang}
                    poll={polling ? SiteSettingsSeoConstants.TABLE_POLLING_INTERVAL : 0}
                >
                    {rows => {
                        const isEmpty = !rows[0];
                        return (
                            <>
                                <div className={classes.dropdownDiv}>
                                    {!isEmpty && this.getWorkspaceDropdown({
                                        t,
                                        maxWidth: 'fit-content'
                                    })}
                                </div>
                                <div className={classes.seoCardLayout}>
                                    {isEmpty && <NoVanity path={path}/>}
                                    {!isEmpty &&
                                        <div className={classes.root} data-vud-content-uuid={rows[0].uuid}>
                                            <Paper elevation={0}>
                                                <VanityUrlEnabledContent
                                                    {...this.state.loadParams}
                                                    openCardMode
                                                    lang={dxContext.lang}
                                                    languages={this.props.languages}
                                                    content={rows[0]}
                                                    selection={this.state.selection}
                                                    workspace={this.state.workspace}
                                                    actions={this.actions}
                                                    onChangeSelection={() => {
                                                    }}
                                                />
                                            </Paper>
                                        </div>}
                                </div>

                                {this.state.move.open && <Move
                                    {...this.state.move}
                                    {...this.state.loadParams}
                                    path={dxContext.mainResourcePath}
                                    lang={dxContext.lang}
                                    onClose={this.closeMove}
                                />}

                                {this.state.infoButton.open && <InfoButton
                                    {...this.state.infoButton}
                                    onClose={this.closeInfoButton}
                                />}

                                {this.state.publication.open && <Publication
                                    {...this.state.publication}
                                    onClose={this.closePublication}
                                />}

                                {this.state.deletion.open && <Deletion
                                    {...this.state.deletion}
                                    {...this.state.loadParams}
                                    path={dxContext.mainResourcePath}
                                    lang={dxContext.lang}
                                    onClose={this.closeDeletion}
                                />}

                                {this.state.publishDeletion.open && <PublishDeletion
                                    {...this.state.publishDeletion}
                                    onClose={this.closePublishDeletion}
                                />}
                            </>
                        );
                    }}
                </VanityUrlTableData>
            </div>
        );
    }
}

export default assembleWithHoc(SiteSettingsSeoCardApp);
