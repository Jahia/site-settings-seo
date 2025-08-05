import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, deleteNode } from '@jahia/cypress'
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
    })

    beforeEach('add vanity urls', function () {
        createPage(homePath, pageName, 'default', langEN)

        addVanityUrl(pagePath, 'en', 'vanity-a')
        addVanityUrl(pagePath, 'en', 'vanity-b')
        publishAndWaitJobEnding(pagePath, [langEN])
    })
    afterEach('remove vanity urls', function () {
        deleteNode(pagePath)
        publishAndWaitJobEnding(homePath, [langEN])
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

        vanityRow = vanityUrlsPage.getStagingVanityUrlList().getVanityUrlRow('/vanity-a-renamed')
        vanityRow.get().should('exist')
    })

    it('Verify vanity can not be created if it already exists.', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList(pageName)
        const stagingVanityUrlList = vanityUrlsPage.getStagingVanityUrlList()
        const vanityRow = stagingVanityUrlList.getVanityUrlRow('/vanity-a')
        vanityRow.clickToEdit()
        vanityRow.edit('/vanity-b')
        const fieldError = vanityRow.getError()
        fieldError
            .getErrorMessage()
            .should('contain', 'This vanity URL already points to /sites/editInDashboard/home/testPage')
        fieldError.getLabel().should('contain', 'Already in use')
    })

    it('Verify vanity can not contain invalid characters.', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList(pageName)
        const stagingVanityUrlList = vanityUrlsPage.getStagingVanityUrlList()
        const vanityRow = stagingVanityUrlList.getVanityUrlRow('/vanity-a')
        vanityRow.clickToEdit()
        vanityRow.edit('//invalid')
        const fieldError = vanityRow.getError()
        fieldError.getErrorMessage().should('contain', 'Make sure the url contains only valid characters')
        fieldError.getLabel().should('contain', 'Invalid URL')
    })
})
