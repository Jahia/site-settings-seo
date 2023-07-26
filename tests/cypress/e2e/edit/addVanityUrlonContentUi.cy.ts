import { publishAndWaitJobEnding, addVanityUrl, addNode, editSite, deleteNode } from '@jahia/cypress'
import { addSimplePage } from '../../utils/Utils'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'

import { JContent } from '@jahia/content-editor-cypress/dist/page-object/jcontent'

describe('Add or edit vanity Urls', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const jcontentHomePath = 'pages/home'
    const pageVanityUrl1 = 'page1withNews'
    const newsname = 'Some-interresting-news'
    const newspath = '/sites/digitall/home/' + pageVanityUrl1 + '/area-main/' + newsname

    const visitAndCheck = (url, selector, expectedText) => {
        cy.visit(Cypress.env('JAHIA_URL') + url, { failOnStatusCode: false })
        cy.url().should('include', url).should('not.include', '.html')
        cy.get(selector)
            .invoke('text')
            .then((text) => {
                expect(text).contains(expectedText)
            })
    }

    before('set server test data', function () {
        editSite('digitall', { serverName: 'jahia' })
    })

    beforeEach('create test data', function () {
        addSimplePage(homePath, pageVanityUrl1, pageVanityUrl1, 'en')

        const variablesNews = {
            parentPathOrId: homePath + '/' + pageVanityUrl1 + '/area-main',
            primaryNodeType: 'jnt:news',
            name: newsname,
            properties: [
                { name: 'jcr:title', value: 'Some interresting news', language: 'en' },
                { name: 'jcr:title', value: 'Une nouvelle intéressante"', language: 'fr' },
                { name: 'desc', value: 'Something interresting just happened', language: 'en' },
                { name: 'desc', value: "Quelque chose d'intéressant s'est passé", language: 'fr' },
            ],
        }
        addNode(variablesNews)

        publishAndWaitJobEnding(homePath, ['en', 'fr'])
    })

    afterEach('clear test data', function () {
        deleteNode(homePath + '/' + pageVanityUrl1)

        publishAndWaitJobEnding(homePath, ['en', 'fr'])
        editSite('digitall', { serverName: 'localhost' })
    })

    after('clear server test data', function () {
        editSite('digitall', { serverName: 'localhost' })
    })

    it('Add a first basic vanity URL on a content', function () {
        cy.login()

        JContent.visit('digitall', 'en', jcontentHomePath + '/' + pageVanityUrl1).editComponentByText(
            'Some interresting news',
        )

        const contentEditor = new ContentEditorSEO()

        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('vanityNews1', true)

        publishAndWaitJobEnding(homePath + '/' + pageVanityUrl1)

        visitAndCheck('/vanityNews1', 'h2', 'Some interresting news')
    })

    it('Edit a vanity URL on a content', function () {
        addVanityUrl(newspath, 'en', '/vanityToEdit')

        cy.login()

        JContent.visit('digitall', 'en', jcontentHomePath + '/' + pageVanityUrl1).editComponentByText(
            'Some interresting news',
        )

        const contentEditor = new ContentEditorSEO()

        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.editVanityUrl('/vanityToEdit', 'vanityEdited')

        publishAndWaitJobEnding(newspath)

        visitAndCheck('/vanityEdited', 'h2', 'Some interresting news')

        visitAndCheck('/vanityToEdit', 'h1', '400')
    })

    it('Remove a vanity URL on a content', function () {
        // For this test we use the 2 vanity url auto;atically created when creating a news content

        cy.login()

        JContent.visit('digitall', 'en', jcontentHomePath + '/' + pageVanityUrl1).editComponentByText(
            'Some interresting news',
        )

        const contentEditor = new ContentEditorSEO()

        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.deleteVanityUrl('/news/some-interresting-news')

        publishAndWaitJobEnding(newspath)

        visitAndCheck('/news/une-nouvelle-interessante', 'h2', 'Une nouvelle intéressante')

        visitAndCheck('/news/some-interresting-news', 'h1', '400')
    })
})
