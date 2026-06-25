import { publishAndWaitJobEnding, unpublishNode, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

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

    let pageId
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
        }).then((res) => {
            pageId = res.data.jcr.addNode.uuid
            return res
        })
    }

    before('create test data', function () {
        createSite(siteKey, siteConfig)
        createPage(homePath, pageName, 'default', langEN)

        addVanityUrl(pagePath, 'en', 'vanity-a')
        addVanityUrl(pagePath, 'en', 'vanity-b')
        publishAndWaitJobEnding(pagePath, [langEN])

        // Page for: search
        cy.apollo({
            variables: {
                parentPathOrId: homePath,
                name: 'pageSearch',
                template: 'default',
                language: langEN,
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        }).then((res) => {
            pages['pageSearch'] = res.data.jcr.addNode.uuid
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
        VanityUrlsPage.visit(siteKey, langEN)

        cy.get('input[type="text"]').first().type('unique-search-term')

        cy.get('[data-sel-role="pages-with-vanity"]').should('exist')
        cy.get(`[data-vud-content-uuid="${pages['pageSearch']}"]`).should('exist')
    })
})
