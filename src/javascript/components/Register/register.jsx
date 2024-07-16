import {registerActions} from './registerActions';
import {registerRoutes} from './registerRoutes';
import hashes from './localesHash!';
import {registerPickers} from '~/components/Register/registerPickers';

window.jahia.localeFiles = window.jahia.localeFiles || {};
window.jahia.localeFiles['site-settings-seo'] = hashes;

export const register = () => {
    registerRoutes();
    registerActions();
    registerPickers();
};
