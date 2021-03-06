import React, {useState} from 'react'
import AddVanityUrl from '../../AddVanityUrl';
import {Typography, Loader} from '@jahia/moonstone';
import classes from './SiteSettingsSeoCardApp.scss';

const NoVanity = ({t, path, lang, languages}) => {
    const [loading, setLoading] = useState(false);
    return (
    <div className={classes.noVanity}>
        { loading ? 
            (<Loader size="big"/>) : 
            (<AddVanityUrl path={path} lang={lang} 
                availableLanguages={languages} 
                setParentLoading={setLoading}>

                { (showInput) => !showInput && (
                    <Typography weight="light">
                        {t('label.messages.noVanityUrl')}
                    </Typography>) }
            </AddVanityUrl>) }
    </div>
    );
};

export default NoVanity;
