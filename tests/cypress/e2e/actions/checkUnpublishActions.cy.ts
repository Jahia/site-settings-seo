import {
    publishAndWaitJobEnding,
    createSite,
    deleteSite,
    addVanityUrl,
    createUser,
    deleteUser,
    grantRoles,
    deleteNode,
    unpublishNode,
} from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Test actions of vanity urls', () => {
    const siteKey = 'siteActionCheck'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'basic-page'
    const pagePath = homePath + '/' + pageName
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'site-settings-seo-test-module',
        serverName: 'localhost',
        locale: langEN,
    }

    let pageUuid = ''

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
    })

    beforeEach(() => {
        createPage(homePath, `${pageName}-a`, 'withoutseo', langEN).then(({ data }) => {
            pageUuid = data.jcr.addNode.uuid
            addVanityUrl(`${pagePath}-a`, 'en', '/vanityOnPageA')
        })
        publishAndWaitJobEnding(homePath)
    })

    afterEach(() => {
        deleteNode(`${homePath}/${pageName}-a`)
        publishAndWaitJobEnding(homePath)
    })

    after('Clear test data', function () {
        deleteSite(siteKey)
        deleteUser('editorUser')
    })

    it('Should unpublish action enabled in menu for for content existing in live', function () {
        cy.login('editorUser', 'password')

        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanityOnPageA')

        const menu = vanityUrlRow.openContextualMenu()
        menu.getUnpublishButton().invoke('attr', 'aria-disabled').should('eq', 'false')
        cy.logout()
    })

    it('Should unpublish action disabled in menu for for content not existing in live', function () {
        cy.login('editorUser', 'password')
        unpublishNode(`${homePath}/${pageName}-a`, langEN)

        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanityOnPageA')

        const menu = vanityUrlRow.openContextualMenu()
        menu.getUnpublishButton().invoke('attr', 'aria-disabled').should('eq', 'true')
        cy.logout()
    })
})
