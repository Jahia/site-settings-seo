import {
    publishAndWaitJobEnding,
    createSite,
    deleteSite,
    addVanityUrl,
    setNodeProperty,
    getNodeByPath,
    unpublishNode,
} from '@jahia/cypress'
import { getJahiaVersion } from '@jahia/cypress'
import { compare } from 'compare-versions'

describe('Checks the unpublication of the vanity urls', () => {
    const siteKey = 'testPublishVanityUrls'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'testPage'
    const langEN = 'en'
    const langFR = 'fr'
    const languages = langEN + ',' + langFR
    const pagePath = homePath + '/' + pageName
    const siteConfig = {
        languages: languages,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }
    const vanityUrls = [
        { lang: langEN, name: 'vanity-en', expectedPublished: 'false' },
        { lang: langEN, name: 'vanity-en-2', expectedPublished: 'false' },
        { lang: langFR, name: 'vanity-fr', expectedPublished: 'true' },
    ]

    const createPage = (parent: string, name: string, template: string, lang: string) => {
        return cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: lang,
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
    }

    before('create test data', function () {
        getJahiaVersion().then((jahiaVersion) => {
            console.log(jahiaVersion)
            if (compare(jahiaVersion.release.replace('-SNAPSHOT', ''), '8.2.1', '<')) {
                console.log('Test suite will be skipped, not meeting Jahia version requirement')
                this.skip()
            }
        })
        createSite(siteKey, siteConfig)
        createPage(homePath, pageName, 'default', langEN).then(() => {
            setNodeProperty(pagePath, 'jcr:title', 'fr title', langFR)
        })
        vanityUrls.forEach((vanity) => {
            addVanityUrl(pagePath, vanity.lang, vanity.name)
        })
        publishAndWaitJobEnding(pagePath, [langEN, langFR])
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Check if unpublication only unpublish the vanity in the same language.', function () {
        cy.login()
        unpublishNode(pagePath, langEN)
        vanityUrls.forEach((vanity) => {
            cy.waitUntil(() =>
                getNodeByPath(`${pagePath}/vanityUrlMapping/${vanity.name}`, ['j:published']).then(({ data }) => {
                    return vanity.expectedPublished === data.jcr.nodeByPath.properties[0].value
                }),
            )
        })
    })
})
