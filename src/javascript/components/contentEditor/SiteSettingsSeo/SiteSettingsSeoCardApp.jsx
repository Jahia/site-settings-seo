import React from 'react';
import {VanityUrlTableData} from '~/components/VanityUrlTableData';
import {assembleWithHoc, SiteSettingsSeoApp} from '../../SiteSettingsSeoApp';
import {VanityUrlEnabledContent} from '../../VanityUrlEnabledContent';
import classes from './SiteSettingsSeoCardApp.scss';
import {NoVanity} from './NoVanity';
import {Paper} from '@material-ui/core';
import {ContentEditorTableQuery} from '~/components/gqlQueries';
import {buildTableQueryVariablesOneNode} from '~/components/Utils/Utils';

class SiteSettingsSeoCardApp extends SiteSettingsSeoApp {
    constructor(props) {
        super(props);
    }

    // Override
    render() {
        let {path, t, lang} = this.props;
        let variables = buildTableQueryVariablesOneNode({selectedLanguageCodes: this.props.languages, path: path, lang: lang, ...this.state.loadParams});

        return (
            <div>
                <VanityUrlTableData
                    {...this.state.loadParams}
                    tableQuery={ContentEditorTableQuery}
                    variables={variables}
                >
                    {({rows, loading}) => {
                        const isEmpty = !rows[0];
                        return (
                            <>
                                <div className={classes.dropdownDiv}>
                                    {!isEmpty && this.getWorkspaceDropdown({
                                        t,
                                        classes
                                    })}
                                </div>
                                <div className={classes.seoCardLayout}>
                                    {!loading && isEmpty && <NoVanity path={path}/>}
                                    {!isEmpty &&
                                        <div className={classes.root} data-vud-content-uuid={rows[0].uuid}>
                                            <Paper elevation={0}>
                                                <VanityUrlEnabledContent
                                                    {...this.state.loadParams}
                                                    openCardMode
                                                    lang={lang}
                                                    languages={this.props.languages}
                                                    content={rows[0]}
                                                    selection={this.state.selection}
                                                    workspace={this.state.workspace}
                                                    onChangeSelection={() => {
                                                    }}
                                                />
                                            </Paper>
                                        </div>}
                                </div>
                            </>
                        );
                    }}
                </VanityUrlTableData>
            </div>
        );
    }
}

export default assembleWithHoc(SiteSettingsSeoCardApp);
