import React from 'react';
import InfoButton from '../InfoButton';
import Publication from '../Publication';
import Deletion from '../Deletion';
import PublishDeletion from '../PublishDeletion';
import Move from '../Move';
import {VanityUrlTableData} from './VanityUrlTableData';
import {SiteSettingsSeoApp, SiteSettingsSeoConstants, assembleWithHoc} from '../SiteSettingsSeoApp';
import {VanityUrlEnabledContent} from '../VanityUrlEnabledContent';

// Probably wont work as not a class?
class SiteSettingsSeoCard extends SiteSettingsSeoApp {
    constructor(props) {
        super(props);
    }

    // Override
    render() {
        let {dxContext, classes, path} = this.props;
        let polling = !(this.state.publication.open || this.state.deletion.open || this.state.move.open || this.state.infoButton.open || this.state.publishDeletion.open);

        return (
            <div>
                <div className={classes.layout}>
                    <VanityUrlTableData
                    {...this.state.loadParams}
                    path={path}
                    lang={dxContext.lang}
                    poll={polling ? SiteSettingsSeoConstants.TABLE_POLLING_INTERVAL : 0}
                    >
                        {rows => {
                            if (!rows[0]) {
                                return null;
                            }

                            return (
                            <VanityUrlEnabledContent
                            {...this.state.loadParams}
                            openCardMode
                            lang={dxContext.lang}
                            languages={this.props.languages}
                            content={rows[0]}
                            selection={this.state.selection}
                            actions={this.actions}
                            onChangeSelection={() => {}}
                        />
                      )}}
                    </VanityUrlTableData>

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
                </div>
            </div>
        );
    }
}


export default assembleWithHoc(SiteSettingsSeoCard);
