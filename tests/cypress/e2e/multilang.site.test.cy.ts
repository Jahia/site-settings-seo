import { publishAndWaitJobEnding, createSite, deleteSite, setNodeProperty } from '@jahia/cypress'

describe('Basic tests of seo filter for multilingual site', () => {
    const siteKey = 'headLinksMultiLang'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'without-customer-seo-links'
    const pagePath = homePath + '/' + pageName
    const langEN = 'en'
    const langFR = 'fr'
    const languages = langEN + ',' + langFR
    const siteConfig = {
        languages: languages,
        templateSet: 'site-settings-seo-test-module',
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
        createPage(homePath, pageName, 'withoutseo', langEN)
        setNodeProperty(homePath, 'jcr:title', 'home-fr', 'fr')
        setNodeProperty(pagePath, 'jcr:title', 'without-customer-seo-links-fr', 'fr')
        publishAndWaitJobEnding(homePath, [langEN, langFR])
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
        cy.visit(pagePath + '.html')
        cy.get('link[rel="canonical"]').should('have.attr', 'href', Cypress.config().baseUrl + pagePath + '.html')
        cy.get('link[rel="alternate"]')
            .eq(0)
            .should('have.attr', 'href', Cypress.config().baseUrl + pagePath + '.html')
        cy.get('link[rel="alternate"]')
            .eq(1)
            .should('have.attr', 'href', Cypress.config().baseUrl + '/' + langFR + pagePath + '.html')
    })
})
