import { editSite, publishAndWaitJobEnding, deleteNode } from '@jahia/cypress'
import { addVanityUrl } from '@jahia/cypress'
import { addSimplePage } from '../utils/Utils'

describe(' with special characters', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'pageurlrewrite'
    const pagePath = homePath + '/' + pageName

    before('create test data', function () {
        editSite('digitall', { serverName: 'jahia' })
        cy.login()
        addSimplePage(homePath, pageName, pageName, 'en')
        addVanityUrl(pagePath, 'en', '/page1seo1')
        addVanityUrl(pagePath, 'en', '/page1-seo2')
        addVanityUrl(pagePath, 'en', '/page1seo3')
        publishAndWaitJobEnding(homePath)
    })

    after('clear test data', function () {
        editSite('digitall', { serverName: 'localhost' })
        deleteNode(pagePath)
        publishAndWaitJobEnding(homePath)
    })

    it('Should handle url rewrite with a set of special characters', function () {
        const vanityUrls = ['test', 'test123', 'test-abc', 'test.abc', 'test/abc']

        vanityUrls.forEach((url) => {
            addVanityUrl(pagePath, 'en', url)
            publishAndWaitJobEnding(pagePath)
            cy.visit(pagePath + '.html')
            cy.url().should('include', url).should('not.include', '.html')
        })
    })
})
