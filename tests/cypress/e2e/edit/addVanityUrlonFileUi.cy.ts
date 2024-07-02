import { publishAndWaitJobEnding, editSite } from '@jahia/cypress'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'

import { JContent } from '@jahia/jcontent-cypress/dist/page-object/jcontent'

describe('Add or edit vanity Urls on a file', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const fileName = 'foods.jpg'
    const filePath = '/files/images/backgrounds/'
    const jcontentFilePath = 'media' + filePath

    before('set server test data', function () {
        editSite('digitall', { serverName: 'jahia' })
    })

    after('clear server test data', function () {
        editSite('digitall', { serverName: 'localhost' })
    })

    it('Add a first basic vanity URL on a file', function () {
        cy.login()

        JContent.visit('digitall', 'en', jcontentFilePath)

        // vanity url is not created yet, a direct access should triggers a 404 error
        cy.request({ method: 'GET', url: Cypress.env('JAHIA_URL') + '/vanityFile1', failOnStatusCode: false }).then(
            (response) => {
                expect(response.status).to.eq(404)
            },
        )

        new JContent().switchToListMode()
        new JContent().editComponentByText(fileName)

        const contentEditor = new ContentEditorSEO()

        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('vanityFile1', true)

        publishAndWaitJobEnding(sitePath + filePath + fileName)

        // vanity url is created yet, a direct access allows to download the file
        cy.request(Cypress.env('JAHIA_URL') + '/vanityFile1').then((response) => {
            expect(response.status).to.eq(200)
            const mime = response.headers['content-type']
            expect(mime).to.contains('image/jpeg')
            const length = response.headers['content-length']
            expect(length).to.eq('83342')
        })
    })
})
