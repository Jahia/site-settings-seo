import React, {useState} from 'react';
import AddVanityUrl from '../../AddVanityUrl';
import {Typography, Loader} from '@jahia/moonstone';
import classes from './SiteSettingsSeoCardApp.scss';
import {useTranslation} from 'react-i18next';
import {useVanityUrlContext} from '../../Context/VanityUrl.context';
import * as PropTypes from 'prop-types';

export const NoVanity = ({path}) => {
    const {t} = useTranslation('site-settings-seo');
    const {lang} = useVanityUrlContext();
    const [loading, setLoading] = useState(false);
    return (
        <div className={classes.noVanity}>
            {loading ?
                <Loader size="big"/> :
                <AddVanityUrl path={path}
                              lang={lang}
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
