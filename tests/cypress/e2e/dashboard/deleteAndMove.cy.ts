import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, getComponent } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'
import { MoveValidationDialog } from '../../page-object/components/dialog/MoveValidationDialog'

describe('Delete and move vanity URLs in dashboard', () => {
    const siteKey = 'testDeleteMoveDashboard'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }

    const pages: Record<string, string> = {}

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

    before('Create site and test data', function () {
        createSite(siteKey, siteConfig)

        // Page for: delete and bulk delete
        createPage(homePath, 'pageDelete', 'default', langEN).then(({ data }) => {
            pages['pageDelete'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageDelete', langEN, 'vanity-to-delete')
        addVanityUrl(homePath + '/pageDelete', langEN, 'vanity-bulk-delete-a')
        addVanityUrl(homePath + '/pageDelete', langEN, 'vanity-bulk-delete-b')
        publishAndWaitJobEnding(homePath + '/pageDelete', [langEN])

        // Pages for: move vanity
        createPage(homePath, 'pageMove', 'default', langEN).then(({ data }) => {
            pages['pageMove'] = data.jcr.addNode.uuid
        })
        createPage(homePath, 'targetPage', 'default', langEN).then(({ data }) => {
            pages['targetPage'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageMove', langEN, 'vanity-to-move')
        publishAndWaitJobEnding(homePath + '/pageMove', [langEN])
        publishAndWaitJobEnding(homePath + '/targetPage', [langEN])
    })

    after('Delete site', function () {
        deleteSite(siteKey)
    })

    it('should delete a vanity url from the contextual menu', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageDelete'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-delete')
        const menu = vanityUrlRow.openContextualMenu()
        const deleteDialog = menu.clickOnDelete()
        deleteDialog.markForDeletion()

        pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-delete').getMarkForDeletionBadge().should('exist')
    })

    it('should delete multiple selected vanity urls', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageDelete'])
        pageCard.open()

        const stagingVanityUrls = pageCard.getStagingVanityUrls()
        stagingVanityUrls.getVanityUrlRow('/vanity-bulk-delete-a').select()
        stagingVanityUrls.getVanityUrlRow('/vanity-bulk-delete-b').select()

        const toolbar = vanityUrlsPage.getToolbar()
        const deleteDialog = toolbar.clickOnDelete()
        deleteDialog.markForDeletion()

        stagingVanityUrls.getVanityUrlRow('/vanity-bulk-delete-a').getMarkForDeletionBadge().should('exist')
        stagingVanityUrls.getVanityUrlRow('/vanity-bulk-delete-b').getMarkForDeletionBadge().should('exist')
    })

    it('should move the vanity url to another page', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)

        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageMove'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move')
        const menu = vanityUrlRow.openContextualMenu()
        const picker = menu.clickOnMove()

        cy.get('li[data-sel-role="home"]').click()
        picker.getTable().getRowByLabel('targetPage').click()
        picker.select()

        const moveValidationDialog = getComponent(MoveValidationDialog)
        moveValidationDialog.move()

        const targetPageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['targetPage'])
        targetPageCard.open()
        targetPageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move').get().should('exist')
    })
})
