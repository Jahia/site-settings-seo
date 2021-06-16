import React from 'react';
import {Collapse, List, Paper, withStyles} from '@material-ui/core';
import {withNotifications, legacyTheme} from '@jahia/react-material';
import SearchBar from './SearchBar';
import {LanguageSelector} from './LanguageSelector';
import {VanityUrlTableView} from './VanityUrlTableView';
import {withTranslation} from 'react-i18next';
import {Selection} from './Selection';
import {Delete, Info, Publish, SwapHoriz} from '@material-ui/icons';
import * as _ from 'lodash';
import InfoButton from './InfoButton';
import Publication from './Publication';
import Deletion from './Deletion';
import PublishDeletion from './PublishDeletion';
import Move from './Move';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {VanityUrlTableData} from './VanityUrlTableData';
import {Header, Dropdown} from '@jahia/moonstone';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';
import {VanityUrlEnabledContent} from "~/components/VanityUrlEnabledContent";

legacyTheme.overrides.MuiSelect.selectMenu.color = 'rgb(37, 43, 47)';
modifyFontFamily();

function modifyFontFamily() {
    Object.getOwnPropertyNames(legacyTheme.typography).forEach(name => {
        if (legacyTheme.typography[name].fontFamily) {
            legacyTheme.typography[name].fontFamily = '"Nunito", \'Nunito Sans\'';
        }
    })
}


const styles = theme => ({
    root: {
        margin: theme.spacing.unit
    },
    title: {
        width: '100%',
        color: 'rgb(37, 43, 47)'
    },
    languageSelector: {
        marginRight: theme.spacing.unit,
        boxShadow: 'none',
        background: 'none',
        color: 'black',

        // Disable any underlining.
        '&:before': {
            background: 'transparent !important'
        },
        '&:after': {
            background: 'transparent'
        }
    },
    languageSelectorIcon: {
        color: 'inherit'
    },
    langSelectMenu: {
        color: 'grey'
    },
    selectionMain: {
        height: '100%'
    },
    layout: {
        marginTop: '-60px',
        height: 'calc(100vh - 70px)',
        overflowY: 'scroll'
    },
    actions: {
        display: 'flex'
    }
});

class SiteSettingsSeoApp extends React.Component {
    constructor(props) {
        super(props);
        let {t} = this.props;

        this.state = {
            loadParams: {
                filterText: '',
                selectedLanguageCodes: this.props.languages.map(language => language.code),
                currentPage: 0,
                pageSize: 10,
                labels: {labelRowsPerPage: props.t('label.pagination.rowsPerPage'), of: props.t('label.pagination.of')}
            },
            selection: [],
            publication: {
                open: false,
                urlPairs: []
            },
            deletion: {
                open: false,
                urlPairs: []
            },
            move: {
                open: false,
                urlPairs: []
            },
            infoButton: {
                open: false,
                message: ''
            },
            publishDeletion: {
                open: false,
                urlPairs: []
            },
            workspace: {
                key: SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[0].key,
                value: SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA[0].value
            }
        };

        this.onChangeSelection = this.onChangeSelection.bind(this);
        this.onChangeFilter = this.onChangeFilter.bind(this);
        this.onChangePage = this.onChangePage.bind(this);
        this.onChangeRowsPerPage = this.onChangeRowsPerPage.bind(this);
        this.onSearchFocus = this.onSearchFocus.bind(this);
        this.onSearchBlur = this.onSearchBlur.bind(this);
        this.onSelectedLanguagesChanged = this.onSelectedLanguagesChanged.bind(this);

        this.openInfoButton = this.openInfoButton.bind(this);
        this.closeInfoButton = this.closeInfoButton.bind(this);

        this.openMove = this.openMove.bind(this);
        this.closeMove = this.closeMove.bind(this);

        this.openPublication = this.openPublication.bind(this);
        this.closePublication = this.closePublication.bind(this);
        this.openDeletion = this.openDeletion.bind(this);
        this.closeDeletion = this.closeDeletion.bind(this);
        this.openPublishDeletion = this.openPublishDeletion.bind(this);
        this.closePublishDeletion = this.closePublishDeletion.bind(this);

        this.actions = {
            deleteAction: {
                priority: 1,
                buttonLabel: t('label.actions.delete'),
                buttonIcon: <Delete/>,
                className: 'delete',
                call: this.openDeletion
            },
            publishAction: {
                priority: 3,
                buttonLabel: t('label.actions.publish'),
                buttonIcon: <Publish/>,
                className: 'publish',
                call: this.openPublication
            },
            publishDeleteAction: {
                buttonIcon: <Delete/>,
                className: 'publishDeletion',
                call: this.openPublishDeletion
            },
            moveAction: {
                priority: 2,
                buttonLabel: t('label.actions.move'),
                buttonIcon: <SwapHoriz/>,
                className: 'move',
                call: this.openMove
            },
            infoButton: {
                buttonIcon: <Info/>,
                className: 'move',
                call: this.openInfoButton
            },
            updateVanity: {
                call: (data, onSuccess, onError) => {
                    try {
                        props.vanityMutationsContext.update([data.urlPair.uuid],
                            data.defaultMapping != null ? data.defaultMapping.toString() : undefined,
                            data.active != null ? data.active.toString() : undefined,
                            data.language,
                            data.url)
                            .then(onSuccess)
                            .catch(ex => {
                                this.handleServerError(ex, onError);
                            });
                    } catch (ex) {
                        this.handleServerError(ex, onError);
                    }
                }
            }
        };

        this.workspaceDropdownData = SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA.map((element) => {
            const obj = {};
            obj['label'] = t('label.workspace.' + element.key);
            obj['value'] = element.value;
            return obj;
        })
    }

    handleServerError(ex, onError) {
        let {t} = this.props;
        let err; let mess;
        if (ex.graphQLErrors && ex.graphQLErrors.length > 0) {
            let graphQLError = ex.graphQLErrors[0];
            err = t(['label.errors.' + graphQLError.errorType, 'label.errors.Error']);
            mess = t(['label.errors.' + graphQLError.errorType + '_message', graphQLError.message], graphQLError.extensions);
        } else {
            err = t(['label.errors.' + ex.name, 'label.errors.Error']);
            mess = t(['label.errors.' + ex.name + '_message', ex.message]);
        }

        onError(err, mess);
    }

    openInfoButton = message => {
        this.setState({
            infoButton: {
                open: true,
                message: message
            }
        });
    };

    closeInfoButton() {
        this.setState({
            infoButton: {
                open: false,
                message: ''
            }
        });
    }

    openMove = urlPairs => {
        this.setState({
            move: {
                open: true,
                urlPairs: urlPairs
            }
        });
    };

    closeMove() {
        this.setState({
            move: {
                open: false,
                urlPairs: []
            },
            selection: []
        });
    }

    openPublication = urlPairs => {
        this.setState({
            publication: {
                open: true,
                urlPairs: urlPairs
            }
        });
    };

    closePublication() {
        this.setState({
            publication: {
                open: false,
                urlPairs: []
            },
            selection: []
        });
    }

    openDeletion = urlPairs => {
        this.setState({
            deletion: {
                open: true,
                urlPairs: urlPairs
            }
        });
    };

    closeDeletion() {
        this.setState({
            deletion: {
                open: false,
                urlPairs: []
            },
            selection: []
        });
    }

    openPublishDeletion = urlPairs => {
        this.setState({
            publishDeletion: {
                open: true,
                urlPairs: urlPairs
            }
        });
    };

    closePublishDeletion = urlPairs => {
        this.setState({
            publishDeletion: {
                open: false,
                urlPairs: []
            }
        });
    };

    onChangeSelection(add, urlPairs) {
        if (!urlPairs) {
            // Clear selection
            this.setState({
                selection: []
            });
        } else {
            this.setState(previous => ({
                selection: add ? _.unionBy(previous.selection, urlPairs, 'uuid') : _.pullAllBy(previous.selection, urlPairs, 'uuid')
            }));
        }
    }

    onChangeFilter = filterText => {
        this.setState(state => ({
            loadParams: _.assign({}, state.loadParams, {
                filterText: filterText,
                currentPage: 0
            })
        }));
    };

    onChangePage(newPage) {
        this.setState(state => ({
            loadParams: _.assign({}, state.loadParams, {
                currentPage: newPage
            })
        }));
    }

    onChangeRowsPerPage(newRowsPerPage) {
        this.setState(state => ({
            loadParams: {
                ...state.loadParams,
                pageSize: newRowsPerPage
            }
        }));
    }

    onSearchFocus() {}

    onSearchBlur() {}

    onSelectedLanguagesChanged(selectedLanguageCodes) {
        this.setState(state => ({
            loadParams: _.assign({}, state.loadParams, {
                selectedLanguageCodes: selectedLanguageCodes,
                currentPage: 0
            })
        }));
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.loadParams.selectedLanguageCodes.length === 0 && nextProps.languages && nextProps.languages.length > 0) {
            return {
                loadParams: _.assign({}, prevState.loadParams, {
                    selectedLanguageCodes: nextProps.languages.map(language => language.code)
                })
            };
        }

        return null;
    }

    getWorkspaceDropdown(dropdownProps) {
        const {t, maxWidth, label, value, data, onChange} = dropdownProps;
        return (<Dropdown
            id="workspaceDropdown"
            name="workspaceDropdown"
            isDisabled={false}
            variant="ghost"
            maxWidth={maxWidth || "300px"}
            label={label || t('label.workspace.' + this.state.workspace.key)}
            value={value || this.state.workspace.value}
            data={data || this.workspaceDropdownData}
            onChange={(e, item) => {onChange ||
                this.setState({
                    workspace: {
                        key: SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA.find(element => element.value === item.value).key,
                        value: item.value
                    }
                })
            }}
        />)
    }

    render() {
        let {dxContext, t, classes} = this.props;
        let polling = !(this.state.publication.open || this.state.deletion.open || this.state.move.open || this.state.infoButton.open || this.state.publishDeletion.open);

        return (
            <div>
                <Header
                    title={`${t('label.title')} - ${dxContext.siteTitle}`}
                    mainActions={
                        <div className={classes.actions}>
                            <LanguageSelector
                                languages={this.props.languages}
                                selectedLanguageCodes={this.state.loadParams.selectedLanguageCodes}
                                className={classes.languageSelector}
                                classes={{icon: classes.languageSelectorIcon, selectMenu: classes.langSelectMenu}}
                                onSelectionChange={this.onSelectedLanguagesChanged}
                            />

                            <SearchBar placeholderLabel={t('label.filterPlaceholder')}
                                       onChangeFilter={this.onChangeFilter}
                                       onFocus={this.onSearchFocus}
                                       onBlur={this.onSearchBlur}/>
                        </div>
                    }
                    toolbarLeft={[this.getWorkspaceDropdown({t})]}
                />

                <Selection selection={this.state.selection}
                           actions={this.actions}
                           onChangeSelection={this.onChangeSelection}/>

                <div className={classes.layout}>
                    <VanityUrlTableData
                    {...this.state.loadParams}
                    path={dxContext.mainResourcePath}
                    lang={dxContext.lang}
                    poll={polling ? SiteSettingsSeoConstants.TABLE_POLLING_INTERVAL : 0}
                    >
                        {(rows, totalCount) => (
                            <VanityUrlTableView
                            {...this.state.loadParams}
                            totalCount={totalCount}
                            onChangePage={this.onChangePage}
                            onChangeRowsPerPage={this.onChangeRowsPerPage}>
                                {rows.map(row => (
                                    <div className={classes.root} data-vud-content-uuid={row.uuid}>
                                        <Paper elevation={1}>
                                            <VanityUrlEnabledContent key={row.uuid}
                                               content={row}
                                               lang={dxContext.lang}
                                               filterText={this.state.loadParams.filterText}
                                               selection={this.state.selection}
                                               workspace={this.state.workspace}
                                               actions={this.actions}
                                               languages={this.props.languages}
                                               onChangeSelection={this.onChangeSelection}/>
                                        </Paper>
                                    </div>
                               ))}
                            </VanityUrlTableView>
                          )}
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

const assembleWithHoc = function(component) {
    return _.flowRight(
        withNotifications(),
        withStyles(styles),
        withVanityMutationContext(),
        withTranslation('site-settings-seo')
    )(component);
};

const SiteSettingsSeoComponent = assembleWithHoc(SiteSettingsSeoApp);


export {SiteSettingsSeoComponent, SiteSettingsSeoApp, assembleWithHoc};
