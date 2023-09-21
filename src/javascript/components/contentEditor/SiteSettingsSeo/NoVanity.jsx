import React, {useState} from 'react';
import AddVanityUrl from '../../AddVanityUrl';
import {Typography, Loader} from '@jahia/moonstone';
import classes from './SiteSettingsSeoCardApp.scss';
import {useTranslation} from 'react-i18next';
import {useVanityUrlContext} from '../../Context/VanityUrl.context';
import * as PropTypes from 'prop-types';
import {useNodeChecks} from "@jahia/data-helper";

export const NoVanity = ({path}) => {
    const {t} = useTranslation('site-settings-seo');
    const {lang} = useVanityUrlContext();
    const [loading, setLoading] = useState(false);
    const {loading: loadingPermission, checksResult} = useNodeChecks(
        {path: path, language: lang},
        {requiredPermission: 'jcr:write'}
    );
    return (
        <div className={classes.noVanity}>
            {loading && loadingPermission ?
                <Loader size="big"/> :
                <AddVanityUrl path={path}
                              lang={lang}
                              hasWritePermission={checksResult}
                              setParentLoading={setLoading}
                >
                    {showInput => !showInput && (
                        <Typography weight="light">
                            {t('label.messages.noVanityUrl')}
                        </Typography>)}
                </AddVanityUrl>}
        </div>
    );
};

NoVanity.propTypes = {
    path: PropTypes.string.isRequired
};
