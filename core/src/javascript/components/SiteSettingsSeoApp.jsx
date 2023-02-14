import React from 'react';
import {List, Paper, withStyles} from '@material-ui/core';
import {legacyTheme, Pagination, withNotifications} from '@jahia/react-material';
import SearchBar from './SearchBar';
import LanguageSelector from './LanguageSelector';
import {withTranslation} from 'react-i18next';
import {Information, SwapHoriz, Publish, Dropdown, Header} from '@jahia/moonstone';
import * as _ from 'lodash';
import InfoButton from './InfoButton';
import Publication from './Publication';
import Move from './Move';
import {withVanityMutationContext} from './VanityMutationsProvider';
import {VanityUrlTableData} from './VanityUrlTableData';
import SiteSettingsSeoConstants from './SiteSettingsSeoApp.constants';
import {VanityUrlEnabledContent} from '~/components/VanityUrlEnabledContent';
import {useVanityUrlContext} from './Context/VanityUrl.context';
import {Toolbar} from './Toolbar/Toolbar';
import {DashboardTableQuery} from '~/components/gqlQueries';
import {buildTableQueryVariablesAllVanity} from '~/components/Utils/Utils';

legacyTheme.overrides.MuiSelect.selectMenu.color = 'rgb(37, 43, 47)';
modifyFontFamily();

function modifyFontFamily() {
    Object.getOwnPropertyNames(legacyTheme.typography).forEach(name => {
        if (legacyTheme.typography[name].fontFamily) {
            legacyTheme.typography[name].fontFamily = '"Nunito", \'Nunito Sans\'';
        }
    });
}

const styles = theme => ({
    pageContainer: {
        height: '100vh',
        display: 'flex',
        flexFlow: 'column'
    },
    vanityHeader: {
        minHeight: 'inherit'
    },
    root: {
        margin: theme.spacing.unit
    },
    title: {
        width: '100%',
        color: 'rgb(37, 43, 47)'
    },
    selectionMain: {
        height: '100%'
    },
    layout: {
        marginTop: '-80px',
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
                selectedLanguageCodes: this.props.languages.map(language => language.language),
                currentPage: 0,
                pageSize: 10,
                labels: {labelRowsPerPage: props.t('label.pagination.rowsPerPage'), of: props.t('label.pagination.of')}
            },
            selection: [],
            publication: {
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

        this.actions = {
            publishAction: {
                priority: 3,
                buttonLabel: t('label.actions.publish'),
                buttonIcon: <Publish/>,
                className: 'publish',
                key: 'publishAction',
                call: this.openPublication
            },
            moveAction: {
                priority: 2,
                buttonLabel: t('label.actions.move'),
                buttonIcon: <SwapHoriz/>,
                className: 'move',
                key: 'moveAction',
                call: this.openMove
            },
            infoButton: {
                buttonIcon: <Information/>,
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

        this.workspaceDropdownData = SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA.map(element => {
            const obj = {};
            obj.label = t('label.workspace.' + element.key);
            obj.value = element.value;
            return obj;
        });
    }

    handleServerError(ex, onError) {
        let {t} = this.props;
        let err;
        let mess;
        if (ex.graphQLErrors && ex.graphQLErrors.length > 0) {
            let graphQLError = ex.graphQLErrors[0];
            const messageKey = graphQLError.extensions.existingNodePath ? 'used' : 'notAllowed';
            err = t(`label.errors.GqlConstraintViolationException.${messageKey}`);
            mess = t(`label.errors.GqlConstraintViolationException.${messageKey}_message`, graphQLError.extensions);
            if (graphQLError.extensions.errorMessage) {
                console.error(graphQLError.extensions.errorMessage);
            }
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

    onSearchFocus() {
    }

    onSearchBlur() {
    }

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
                    selectedLanguageCodes: nextProps.languages.map(language => language.language)
                })
            };
        }

        return null;
    }

    getWorkspaceDropdown(dropdownProps) {
        const {t, classes, label, value, data, onChange} = dropdownProps;
        return (
            <Dropdown
                key="dropdown"
                id="workspaceDropdown"
                name="workspaceDropdown"
                isDisabled={false}
                variant="ghost"
                className={classes.workspaceDropdown}
                label={label || t('label.workspace.' + this.state.workspace.key)}
                value={value || this.state.workspace.value}
                data={data || this.workspaceDropdownData}
                onChange={(e, item) => {
                    onChange ||
                    this.setState({
                        workspace: {
                            key: SiteSettingsSeoConstants.VANITY_URL_WORKSPACE_DROPDOWN_DATA.find(element => element.value === item.value).key,
                            value: item.value
                        }
                    });
                }}
            />
        );
    }

    render() {
        let {siteInfo, t, classes, lang, polling: globalPolling} = this.props;
        let polling = !(this.state.publication.open || this.state.move.open || this.state.infoButton.open);
        let variables = buildTableQueryVariablesAllVanity({selectedLanguageCodes: this.state.loadParams.selectedLanguageCodes, path: siteInfo.path, lang: lang, poll: polling ? SiteSettingsSeoConstants.TABLE_POLLING_INTERVAL : 0, ...this.state.loadParams});

        return (
            <div className={classes.pageContainer}>
                <VanityUrlTableData
                    {...this.state.loadParams}
                    tableQuery={DashboardTableQuery}
                    variables={variables}
                    path={siteInfo.path}
                    lang={lang}
                    poll={polling ? SiteSettingsSeoConstants.TABLE_POLLING_INTERVAL : 0}
                >
                    {(rows, totalCount) => (
                        <>
                            <Header key="head"
                                    className={classes.vanityHeader}
                                    title={`${t('label.title')} - ${siteInfo.displayName}`}
                                    mainActions={
                                        <div className={classes.actions}>
                                            <LanguageSelector
                                                languages={this.props.languages}
                                                selectedLanguageCodes={this.state.loadParams.selectedLanguageCodes}
                                                onSelectionChange={this.onSelectedLanguagesChanged}
                                            />

                                            <SearchBar placeholderLabel={t('label.filterPlaceholder')}
                                                       onChangeFilter={this.onChangeFilter}
                                                       onFocus={this.onSearchFocus}
                                                       onBlur={this.onSearchBlur}/>
                                        </div>
                                    }
                                    toolbarLeft={!rows[0] ? [] : [this.getWorkspaceDropdown({t, classes})]}
                            />

                            <Toolbar selection={this.state.selection}
                                     actions={this.actions}
                                     onChangeSelection={this.onChangeSelection}/>

                            <div className={classes.layout}>
                                <List>
                                    {rows.map(row => (
                                        <div key={row.uuid} className={classes.root} data-vud-content-uuid={row.uuid}>
                                            <Paper elevation={1}>
                                                <VanityUrlEnabledContent key={row.uuid}
                                                                         openCardMode={false}
                                                                         content={row}
                                                                         lang={lang}
                                                                         filterText={this.state.loadParams.filterText}
                                                                         selection={this.state.selection}
                                                                         workspace={this.state.workspace}
                                                                         actions={this.actions}
                                                                         languages={this.props.languages}
                                                                         onChangeSelection={this.onChangeSelection}/>
                                            </Paper>
                                        </div>
                                    ))}
                                </List>
                                <Pagination {...this.state.loadParams}
                                            totalCount={totalCount || 0}
                                            onChangePage={this.onChangePage}
                                            onChangeRowsPerPage={this.onChangeRowsPerPage}/>
                                {this.state.move.open && <Move
                                    {...this.state.move}
                                    {...this.state.loadParams}
                                    path={siteInfo.path}
                                    lang={lang}
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
                            </div>
                        </>
                    )}
                </VanityUrlTableData>
            </div>
        );
    }
}

const assembleWithHoc = function (component) {
    return _.flowRight(
        withNotifications(),
        withStyles(styles),
        withVanityMutationContext(),
        withTranslation('site-settings-seo')
    )(component);
};

const SiteSettingsSeoComponent = assembleWithHoc(SiteSettingsSeoApp);

const SiteSettingsSeoFunctionalComponent = props => {
    const {languages, siteInfo, polling} = useVanityUrlContext();
    return (<SiteSettingsSeoComponent languages={languages} siteInfo={siteInfo} polling={polling} {...props}/>);
};

export {SiteSettingsSeoFunctionalComponent, SiteSettingsSeoComponent, SiteSettingsSeoApp, assembleWithHoc};

