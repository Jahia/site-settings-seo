import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, deleteNode } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Checks the deletion action on vanity urls', () => {
    const siteKey = 'testDeleteVanity'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'

    const pageAName = 'sourcePage'
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

        publishAndWaitJobEnding(pageAPath, [langEN])
    })

    afterEach('Clear test data', function () {
        deleteNode(homePath + '/' + pageAName)

        publishAndWaitJobEnding(homePath, ['en'])
    })

    after('Delete site', function () {
        deleteSite(siteKey)
    })

    it('Should mark for deletion on delete then remove on publish', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')

        const pageACard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageAUuid)
        pageACard.open()

        let vanityUrlRow = pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-1')
        const menu = vanityUrlRow.openContextualMenu()
        const markForDeletionDialog = menu.clickOnDelete()
        markForDeletionDialog.markForDeletion()

        vanityUrlRow = pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-1')
        vanityUrlRow.getMarkForDeletionBadge().should('exist')

        pageACard.getStagingVanityUrls().get().find(`tr[data-vud-url="/vanity-a-1"]`).should('exist')

        const publicationValidationDialog = vanityUrlRow.openContextualMenu().clickOnPublish()
        publicationValidationDialog.publish()

        pageACard.getStagingVanityUrls().get().find(`tr[data-vud-url="/vanity-a-1"]`).should('not.exist')

        cy.logout()
    })

    it('Should delete and publish all vanity of a page then the page should not be displayed', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')

        let pageACard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageAUuid)
        pageACard.open()

        pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-1').select()
        pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-2').select()

        let toolbar = vanityUrlsPage.getToolbar()

        const markForDeletionDialog = toolbar.clickOnDelete()
        markForDeletionDialog.markForDeletion()

        pageACard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageAUuid)

        pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-1').select()
        pageACard.getStagingVanityUrls().getVanityUrlRow('/vanity-a-2').select()

        toolbar = vanityUrlsPage.getToolbar()

        vanityUrlsPage.getPagesWithVanityUrl().get().find(`[data-vud-content-uuid="${pageAUuid}"]`).should('exist')

        toolbar.clickOnPublish().publish()

        vanityUrlsPage.getPagesWithVanityUrl().get().find(`[data-vud-content-uuid="${pageAUuid}"]`).should('not.exist')

        cy.logout()
    })
})
