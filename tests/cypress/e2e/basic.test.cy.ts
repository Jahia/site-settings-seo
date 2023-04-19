import { publishAndWaitJobEnding, createSite, deleteSite } from '@jahia/cypress'

describe("Basic tests of the module's seo filter", () => {
    const siteKey = 'headLinksTest'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const templateSet = 'site-settings-seo-test-module'

    const createPage = (parent: string, name: string, template: string) => {
        cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: 'en',
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
    }

    before('create test data', function () {
        createSite(siteKey, { languages: 'en', templateSet: templateSet, serverName: 'localhost', locale: 'en' })
        createPage(homePath, 'without-seo-links', 'withoutseo')
        publishAndWaitJobEnding(homePath)
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Verify no duplicate SEO links on page with existing SEO links.', function () {
        cy.visit(homePath + '.html')
        cy.get('link[rel="canonical"]').should('have.attr', 'href', 'http://localhost/canonical/home/en')
        cy.get('link[rel="canonical"]').should('not.have.attr', 'href', Cypress.config().baseUrl + homePath + '.html')
        cy.get('link[rel="alternate"]').should('not.have.attr', 'href', Cypress.config().baseUrl + homePath + '.html')
    })

    it('Verify proper addition of SEO links on page without existing SEO links', function () {
        cy.visit(homePath + '/without-seo-links.html')
        cy.get('link[rel="canonical"]').should(
            'have.attr',
            'href',
            Cypress.config().baseUrl + homePath + '/without-seo-links.html',
        )
        cy.get('link[rel="alternate"]').should(
            'have.attr',
            'href',
            Cypress.config().baseUrl + homePath + '/without-seo-links.html',
        )
    })
})
