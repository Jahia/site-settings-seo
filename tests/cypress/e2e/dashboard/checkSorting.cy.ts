import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Checks the sort of pages in dashboard', () => {
    const siteKey = 'testSort'
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
    const letterList = ['a', '2', 'b2', 'c', 'v', 'e', 'f', 'p', 'h', 'x', 'j', '1', 'C1', 'C3', 'c2']

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
        letterList.forEach((letter) => {
            const pageName = `${prefixPageName}-${letter}`
            const pagePath = homePath + '/' + pageName
            createPage(homePath, pageName, 'default', langEN)
            addVanityUrl(pagePath, 'en', `vanity-${letter}`)
            publishAndWaitJobEnding(pagePath, [langEN])
        })
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Check if pages are sorted by name.', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        const pagesWithVanityUrl = vanityUrlsPage.getPagesWithVanityUrl().items()

        pagesWithVanityUrl.should('have.length', 10)

        const sortedLetters = letterList.sort(Intl.Collator().compare)
        pagesWithVanityUrl.each((page, index) => {
            cy.wrap(page).should('contain', `testPage-${sortedLetters[index]}`)
        })
    })
})
