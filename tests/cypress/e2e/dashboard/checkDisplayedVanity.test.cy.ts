import { publishAndWaitJobEnding, unpublishNode, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Checks on vanity urls dashboard', () => {
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

    const createPage = (parent: string, name: string, template: string, lang: string) => {
        cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: lang,
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        }).then((res) => {
            pageId = res.data.jcr.addNode.uuid
        })
    }

    before('create test data', function () {
        createSite(siteKey, siteConfig)
        createPage(homePath, pageName, 'default', langEN)

        addVanityUrl(pagePath, 'en', 'vanity-a')
        addVanityUrl(pagePath, 'en', 'vanity-b')
        publishAndWaitJobEnding(pagePath, [langEN])
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Verify content correctly displayed for pages with unpublished publication status.', function () {
        cy.login()
        unpublishNode(pagePath, langEN)
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList(pageName)
        vanityUrlsPage.findVanityUrlsTable(pageId).should('exist')
    })
})
