import {registry} from '@jahia/ui-extender';
import i18next from 'i18next';
import {register} from './components/Register/register';

export default function () {
    registry.add('callback', 'siteSettingsSeo', {
        targets: ['jahiaApp-init:23'],
        callback: async () => {
            await i18next.loadNamespaces('site-settings-seo');
            register();
            console.log('%c Site Settings SEO registered routes', 'color: #3c8cba');
        }
    });
}
