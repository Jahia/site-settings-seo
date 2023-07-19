import { editSite, publishAndWaitJobEnding, deleteNode } from '@jahia/cypress'
import { addVanityUrl } from '@jahia/cypress'
import { addSimplePage } from '../utils/Utils'

describe('Basic test of vanity url access', () => {
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

    it('Should redirect to the canonical vanity url', function () {
        cy.visit(pagePath + '.html')
        cy.url().should('include', 'page1seo3').should('not.include', '.html')

        cy.visit(Cypress.env('JAHIA_URL') + '/page1seo1')
        cy.url().should('include', 'page1seo3').should('not.include', 'page1seo1').should('not.include', '.html')

        cy.visit(Cypress.env('JAHIA_URL') + '/page1-seo2')
        cy.url().should('include', 'page1seo3').should('not.include', 'page1-seo2').should('not.include', '.html')
    })
})
