import {
    publishAndWaitJobEnding,
    createSite,
    deleteSite,
    addVanityUrl,
    createUser,
    deleteUser,
    grantRoles,
    deleteNode,
} from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Test permissions for publication', () => {
    const siteKey = 'siteForPermissionsPublicationCheck'
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
        createUser('editorInChiefUser', 'password')
        grantRoles(sitePath, ['editor'], 'editorUser', 'USER')
        grantRoles(sitePath, ['editor-in-chief'], 'editorInChiefUser', 'USER')
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
        deleteUser('editorInChiefUser')
    })

    it('Should user see request publication when is editor', function () {
        cy.login('editorUser', 'password')

        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        let pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        pageCard.open()
        pageCard.getRequestAllPublicationButton().should('exist')

        let vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanityOnPageA')
        vanityUrlRow.clickToEdit()
        vanityUrlRow.edit('/updatedValue')

        pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/updatedValue')
        const menu = vanityUrlRow.openContextualMenu()
        menu.getRequestPublicationButton().should('exist')

        cy.logout()
    })

    it('Should user see publish button when is editor in chief', function () {
        cy.login('editorInChiefUser', 'password')

        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        let pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        pageCard.open()
        pageCard.getPublishAllButton().should('exist')

        let vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanityOnPageA')
        vanityUrlRow.clickToEdit()
        vanityUrlRow.edit('/updatedValue')

        pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/updatedValue')
        const menu = vanityUrlRow.openContextualMenu()
        menu.getPublishButton().should('exist')

        cy.logout()
    })
})
