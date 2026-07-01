import { publishAndWaitJobEnding, unpublishNode, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'
import { addSimplePage } from '../../utils/Utils'

describe('Checks on vanity urls in dashboard', () => {
    const siteKey = 'testSite'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'testPage'
    const pagePath = homePath + '/' + pageName
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }

    let pageId: string
    const pages: Record<string, string> = {}

    before('create test data', function () {
        createSite(siteKey, siteConfig)
        addSimplePage(homePath, pageName, pageName, langEN, 'default').then(({ data }) => {
            pageId = data.jcr.addNode.uuid
        })

        addVanityUrl(pagePath, 'en', 'vanity-a')
        addVanityUrl(pagePath, 'en', 'vanity-b')
        publishAndWaitJobEnding(pagePath, [langEN])

        // Page for: search
        addSimplePage(homePath, 'pageSearch', 'pageSearch', langEN, 'default').then(({ data }) => {
            pages['pageSearch'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageSearch', langEN, 'unique-search-term')
        addVanityUrl(homePath + '/pageSearch', langEN, 'other-vanity')
        publishAndWaitJobEnding(homePath + '/pageSearch', [langEN])
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('verify content correctly displayed for pages with unpublished publication status.', function () {
        cy.login()
        unpublishNode(pagePath, langEN)
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList(pageName)
        vanityUrlsPage.findVanityUrlsTable(pageId).should('exist')
    })

    it('should display a published vanity url in the dashboard', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageId)
        pageCard.open()
        pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-a').get().should('exist')
    })

    it('should find the vanity url when searching', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)

        vanityUrlsPage.getSearchBar().search('unique-search-term')

        const pagesWithVanityUrl = vanityUrlsPage.getPagesWithVanityUrl()
        pagesWithVanityUrl.get().should('exist')
        pagesWithVanityUrl.getPageCard(pages['pageSearch']).get().should('exist')
    })
})
