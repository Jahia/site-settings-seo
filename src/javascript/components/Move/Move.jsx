import React, {useState, useRef} from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormHelperText,
    Paper,
    TextField
} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {Picker} from '@jahia/data-helper';
import {PickerViewMaterial, useNotifications} from '@jahia/react-material';
import {DashboardTableQuery, GetNodeQuery} from '../gqlQueries';
import {useApolloClient, useQuery} from '@apollo/client';
import gql from 'graphql-tag';
import {Button, Checkbox, Typography} from '@jahia/moonstone';
import {buildTableQueryVariablesAllVanity} from '~/components/Utils/Utils';
import {MoveMutation} from '~/components/gqlMutations';
import classes from './Move.scss';
import * as PropTypes from 'prop-types';

export const Move = ({lang, path, urlPairs, isOpen, onClose, ...props}) => {
    const notificationContext = useNotifications();
    const {t} = useTranslation('site-settings-seo');
    const [targetPath, setTargetPath] = useState('');
    const [saveDisabled, setSaveDisabled] = useState(true);
    const picker = useRef();
    const selectableTypes = ['jmix:mainResource', 'jnt:page'];

    const client = useApolloClient();

    const handleMove = () => {
        if (!targetPath.startsWith(path)) {
            notificationContext.notify(t('label.errors.moveSiteError'), ['closeAfter5s']);
            return;
        }

        client.mutate({
            mutation: MoveMutation,
            variables: {
                pathsOrIds: urlPairs.map(urlPair => urlPair.uuid),
                target: targetPath
            }, refetchQueries: [{
                query: DashboardTableQuery,
                variables: buildTableQueryVariablesAllVanity(props)
            }]
        }).then(() => {
            handleClose();
            notificationContext.notify(t('label.notifications.moveConfirmed'), ['closeAfter5s']);
        }).catch(errors => {
            if (errors.graphQLErrors) {
                errors.graphQLErrors.forEach(error => {
                    notificationContext.notify(error.message, ['closeButton', 'noAutomaticClose']);
                });
            } else {
                notificationContext.notify(t('label.errors.Error'), ['closeButton', 'noAutomaticClose']);
            }

            console.log(errors);
        });
    };

    const handleSaveDisabled = () => {
        setSaveDisabled(previous => !previous);
    };

    const handleTargetPathChange = event => {
        setTargetPath(event.target.value);
    };

    const handleClose = () => {
        setTargetPath('');
        setSaveDisabled(true);
        onClose();
    };

    const {loading, error, data} = useQuery(GetNodeQuery, {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
        variables: {path: targetPath, types: selectableTypes}
    });

    if (!loading && !error && data && data.jcr && data.jcr.nodeByPath.inPicker) {
        setTimeout(() => {
            // eslint-disable-next-line no-unused-expressions
            picker?.current?.openPaths(data.jcr.nodeByPath.path.substring(0, data.jcr.nodeByPath.path.lastIndexOf('/') + 1));
        });
    }

    return (
        <div>
            <Dialog
                open={isOpen}
                classes={{root: classes.dialogRoot}}
                aria-labelledby="form-dialog-title"
                data-vud-role="dialog"
                onClose={handleClose}
            >
                <DialogTitle id="form-dialog-title">{t('label.dialogs.move.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('label.dialogs.move.content')}</DialogContentText>
                    <FormControl className={classes.formControl}>
                        <TextField
                            autoFocus
                            fullWidth
                            error={Boolean(error)}
                            id="targetPath"
                            type="text"
                            placeholder="Enter a path"
                            className={classes.filterPath}
                            value={targetPath}
                            onChange={handleTargetPathChange}
                        />
                        <FormHelperText className={classes.helperContainer}>{error &&
                            <error><label>{t('label.errors.MoveInvalidTarget')}</label>
                                <message
                                    className={classes.helperErrorMessage}
                                >{t(['label.errors.MoveInvalidTarget_message', 'label.errors.MoveInvalidTarget'])}
                                </message>
                            </error>}
                        </FormHelperText>
                    </FormControl>
                    <Paper elevation={4} classes={{root: classes.pickerRoot}}>
                        <Picker ref={picker}
                                fragments={['displayName', {
                                    applyFor: 'node',
                                    gql: gql`fragment PrimaryNodeTypeName on JCRNode { primaryNodeType { name } }`
                                }]}
                                rootPaths={[path]}
                                defaultOpenPaths={[path]}
                                openableTypes={['jnt:page', 'jnt:virtualsite', 'jnt:navMenuText', 'jmix:droppableContent', 'jmix:mainResource']}
                                selectableTypes={selectableTypes}
                                queryVariables={{language: lang}}
                                selectedPaths={!loading && !error && data.jcr && data.jcr.nodeByPath.inPicker ? [data.jcr.nodeByPath.path] : []}
                                onSelectItem={setTargetPath}
                        >
                            {({loading, ...others}) => (
                                <PickerViewMaterial {...others}
                                                    textRenderer={entry => entry.node.displayName}/>
                            )}
                        </Picker>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Checkbox className={classes.checkbox}
                              checked={!saveDisabled}
                              data-vud-role="checkbox-hint"
                              onChange={handleSaveDisabled}/>
                    <Typography>
                        {t('label.dialogs.move.confirm')}
                    </Typography>
                    <div className="flexFluid"/>
                    <Button color="default"
                            size="big"
                            label={t('label.cancel')}
                            data-vud-role="button-cancel"
                            onClick={handleClose}/>
                    <Button color="accent"
                            size="big"
                            label={t('label.dialogs.move.move')}
                            disabled={saveDisabled || targetPath.length === 0 || Boolean(error)}
                            data-vud-role="button-primary"
                            onClick={handleMove}
                    />
                </DialogActions>
            </Dialog>
        </div>
    );
};

Move.propTypes = {
    lang: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    urlPairs: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired
};
