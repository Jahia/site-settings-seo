import {
    publishAndWaitJobEnding,
    unpublishNode,
    createSite,
    deleteSite,
    addVanityUrl,
    createUser,
    deleteUser,
    grantRoles
} from '@jahia/cypress'
import {VanityUrlsPage} from "../page-object/vanityUrls.page";

describe('Vanity URLs - Unpublish Page Behavior', () => {
    const siteKey = 'unpublishPageBehaviorCheck'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'basic-page'
    const pagePath = homePath + '/' + pageName
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'site-settings-seo-test-module',
        serverName: 'jahia',
        locale: langEN,
    }

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

    before('Create test data', function () {
        createSite(siteKey, siteConfig)
        cy.log('Add user to check permissions')
        createUser('editorUser', 'password')
        grantRoles(sitePath, ['editor'], 'editorUser', 'USER')
        createPage(homePath, pageName, 'withseo', langEN).then(() => {
            addVanityUrl(pagePath, 'en', '/vanity1')
            addVanityUrl(pagePath, 'en', '/vanity2')
        })
        publishAndWaitJobEnding(homePath)
    })

    after('Clear test data', function () {
        deleteUser('editorUser')
        deleteSite(siteKey)
    })

    it('In live mode: Both vanity URLs work after publish', () => {
        cy.request({
            url: 'http://jahia:8080/vanity1',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
        cy.request({
            url: 'http://jahia:8080/vanity2',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })

    it('In live mode: Both vanity URLs return 404 after page unpublish', () => {
        unpublishNode(pagePath, langEN);
        cy.request({
            url: 'http://jahia:8080/vanity1',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404)
        })
        cy.request({
            url: 'http://jahia:8080/vanity2',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404)
        })
    })

    it('In edit mode: The "Manage custom URLs" feature remains accessible after page unpublish', () => {
        cy.login('editorUser', 'password')
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList(pageName)
        cy.logout()
    })

})
