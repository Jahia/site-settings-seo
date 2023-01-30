import {registerActions} from './registerActions';
import {registerRoutes} from './registerRoutes';

export const register = () => {
    registerRoutes();
    registerActions();
};
