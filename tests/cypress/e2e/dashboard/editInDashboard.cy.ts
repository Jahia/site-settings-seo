import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Edit vanity url in urls dashboard', () => {
    const siteKey = 'editInDashboard'
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
        createPage(homePath, pageName, 'default', langEN)

        addVanityUrl(pagePath, 'en', 'vanity-a')
        addVanityUrl(pagePath, 'en', 'vanity-b')
        publishAndWaitJobEnding(pagePath, [langEN])
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Verify vanity can be edited after emptying the field.', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList(pageName)
        const stagingVanityUrlList = vanityUrlsPage.getStagingVanityUrlList()
        let vanityRow = stagingVanityUrlList.getVanityUrlRow('/vanity-a')
        vanityRow.clickToEdit()
        vanityRow.edit('')
        const fieldError = vanityRow.getError()
        fieldError.getErrorMessage().should('contain', 'The vanity URL cannot be empty')
        fieldError.getLabel().should('contain', 'Invalid URL')
        vanityRow.edit('/vanity-a-renamed')

        vanityRow = stagingVanityUrlList.getVanityUrlRow('/vanity-a')
        vanityRow.get().should('exist')
    })
})
