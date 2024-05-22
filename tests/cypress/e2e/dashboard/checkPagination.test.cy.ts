import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Checks the pagination of vanity url in dashboard', () => {
    const siteKey = 'testPagination'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const prefixPageName = 'testPage'
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }

    const createPage = (parent: string, name: string, template: string, lang: string) => {
        cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: lang,
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
    }

    before('create test data', function () {
        createSite(siteKey, siteConfig)
        for (let i = 0; i < 11; i++) {
            const pageName = `${prefixPageName}-${i}`
            const pagePath = homePath + '/' + pageName
            createPage(homePath, pageName, 'default', langEN)
            addVanityUrl(pagePath, 'en', `vanity-${i}`)
            publishAndWaitJobEnding(pagePath, [langEN])
        }
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Check if pagination button correctly change to other page.', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        const pagesWithVanityUrl = vanityUrlsPage.getPagesWithVanityUrl().items()

        pagesWithVanityUrl.should('have.length', 10)

        const pagination = vanityUrlsPage.getPagination()

        pagination.get().contains('1-10 of 11')
        pagination.next()
        pagination.get().contains('11-11 of 11')

        // Check the page row is correctly displayed in a paginated list
        vanityUrlsPage.findPageRow('testPage-10')
    })
})
