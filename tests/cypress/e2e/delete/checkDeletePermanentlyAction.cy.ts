import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, deleteNode } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Checks the delete permanenty action on vanity urls', () => {
    const siteKey = 'testDeletePermanentlyVanity'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'

    const pageAName = 'pageA'
    const pageAPath = homePath + '/' + pageAName
    let pageAUuid = ''

    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
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
    before('Create site', function () {
        createSite(siteKey, siteConfig)
    })

    beforeEach('Create test data', function () {
        createPage(homePath, pageAName, 'default', langEN).then(({ data }) => {
            pageAUuid = data.jcr.addNode.uuid
        })

        addVanityUrl(pageAPath, langEN, 'vanity-a-1')
        addVanityUrl(pageAPath, langEN, 'vanity-a-2')

        publishAndWaitJobEnding(`${pageAPath}/vanityUrlMapping/vanity-a-2`, [langEN])
    })

    afterEach('Clear test data', function () {
        deleteNode(homePath + '/' + pageAName)

        publishAndWaitJobEnding(homePath, ['en'])
    })

    after('Delete site', function () {
        deleteSite(siteKey)
    })

    it('Should delete permanently be visible when not published vanity is marked for deletion', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')

        const pageACard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageAUuid)
        pageACard.open()

        let vanityUrlRow1 = pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-1')

        let contextualMenu = vanityUrlRow1.openContextualMenu()
        const markForDeletionDialog = contextualMenu.clickOnDelete()
        markForDeletionDialog.markForDeletion()

        cy.log('Check the delete permanently button is visible on not published vanity urls')
        vanityUrlRow1 = pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-1')
        vanityUrlRow1.getMarkForDeletionBadge().should('exist')

        contextualMenu = vanityUrlRow1.openContextualMenu()
        contextualMenu.getDeletePermanentlyButton().should('exist')
        contextualMenu.getPublishButton().should('not.exist')

        cy.logout()
    })

    it('Should publish be visible when published vanity is marked for deletion', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')

        const pageACard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageAUuid)
        pageACard.open()

        let vanityUrlRow2 = pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-2')

        let contextualMenu = vanityUrlRow2.openContextualMenu()
        const markForDeletionDialog = contextualMenu.clickOnDelete()
        markForDeletionDialog.markForDeletion()

        cy.log('Check the publish button is visible on published vanity urls')
        vanityUrlRow2 = pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-2')
        vanityUrlRow2.getMarkForDeletionBadge().should('exist')

        contextualMenu = vanityUrlRow2.openContextualMenu()

        contextualMenu.getPublishButton().should('exist')
        contextualMenu.getDeletePermanentlyButton().should('not.exist')

        cy.logout()
    })
})
