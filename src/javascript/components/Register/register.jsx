import {registerActions} from './registerActions';
import {registerRoutes} from './registerRoutes';
import {registerPickers} from '~/components/Register/registerPickers';

export const register = () => {
    registerRoutes();
    registerActions();
    registerPickers();
};
