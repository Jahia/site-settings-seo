const deps = require('./package.json').dependencies;

const sharedDeps = [
    '@babel/polyfill',
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    'react-i18next',
    'i18next',
    'i18next-xhr-backend',
    'graphql-tag',
    'react-apollo',
    'redux',
    'react-redux',
    'rxjs',
    'whatwg-fetch',
    'dayjs',

    // JAHIA PACKAGES
    '@jahia/react-material',
    '@jahia/ui-extender',
    '@jahia/moonstone',
    '@jahia/moonstone-alpha',
    '@jahia/data-helper',

    // Apollo
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hooks'
];

const singletonDeps = [
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    'react-i18next',
    'i18next',
    'react-apollo',
    'react-redux',
    'redux',
    '@jahia/moonstone',
    '@jahia/ui-extender',
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hooks'
];

const notImported = [
    '@jahia/react-material',
    '@jahia/moonstone'
];

const shared = sharedDeps.filter(item => deps[item]).reduce((acc, item) => ({
    ...acc,
    [item]: {
        requiredVersion: deps[item]
    }
}), {});

singletonDeps.filter(item => shared[item]).forEach(item => {
    shared[item].singleton = true;
});

notImported.filter(item => shared[item]).forEach(item => {
    shared[item].import = false;
});

module.exports = shared;
