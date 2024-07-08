import {registerActions} from './registerActions';
import {registerRoutes} from './registerRoutes';
import hashes from './localesHash!';

window.jahia.localeFiles = window.jahia.localeFiles || {};
window.jahia.localeFiles['site-settings-seo'] = hashes;

export const register = () => {
    registerRoutes();
    registerActions();
};
