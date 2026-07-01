import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'
import { addSimplePage } from '../../utils/Utils'

describe('Publish vanity URLs in dashboard', () => {
    const siteKey = 'testPublishDashboard'
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

    before('Create site and test data', function () {
        createSite(siteKey, siteConfig)

        // Page for: publish and bulk publish
        addSimplePage(homePath, 'pagePublish', 'pagePublish', langEN, 'default').then(({ data }) => {
            pages['pagePublish'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pagePublish', langEN, 'vanity-to-publish')
        publishAndWaitJobEnding(homePath + '/pagePublish', [langEN])
        addVanityUrl(homePath + '/pagePublish', langEN, 'vanity-unpublished')
        addVanityUrl(homePath + '/pagePublish', langEN, 'vanity-bulk-pub-new-a')
        addVanityUrl(homePath + '/pagePublish', langEN, 'vanity-bulk-pub-new-b')
    })

    after('Delete site', function () {
        deleteSite(siteKey)
    })

    it('should publish a vanity url from the contextual menu', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pagePublish'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-unpublished')
        const menu = vanityUrlRow.openContextualMenu()
        const publishDialog = menu.clickOnPublish()
        publishDialog.publish()

        vanityUrlsPage.switchToStagingAndLiveMode()
        pageCard.getLiveVanityUrls().getVanityUrlRow('/vanity-unpublished').get().should('exist')
    })

    it('should publish multiple selected vanity urls', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pagePublish'])
        pageCard.open()

        const stagingVanityUrls = pageCard.getStagingVanityUrls()
        stagingVanityUrls.getVanityUrlRow('/vanity-bulk-pub-new-a').select()
        stagingVanityUrls.getVanityUrlRow('/vanity-bulk-pub-new-b').select()

        const toolbar = vanityUrlsPage.getToolbar()
        const publishDialog = toolbar.clickOnPublish()
        publishDialog.publish()

        toolbar.close()

        vanityUrlsPage.switchToStagingAndLiveMode()
        pageCard.getLiveVanityUrls().getVanityUrlRow('/vanity-bulk-pub-new-a').get().should('exist')
        pageCard.getLiveVanityUrls().getVanityUrlRow('/vanity-bulk-pub-new-b').get().should('exist')
    })
})
