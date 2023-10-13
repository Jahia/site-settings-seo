import { publishAndWaitJobEnding, editSite, addVanityUrl } from '@jahia/cypress'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'
import { JContent } from '@jahia/jcontent-cypress/dist/page-object/jcontent'

describe('Remove vanity Urls from a file', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const fileName = 'foods.jpg'
    const filePath = '/files/images/backgrounds/'
    const jcontentFilePath = 'media' + filePath

    before('set server test data', function () {
        editSite('digitall', { serverName: 'jahia' })
        addVanityUrl(sitePath + filePath + fileName, 'en', '/vanityFileToRemove')
        publishAndWaitJobEnding(sitePath + filePath + fileName)
    })

    after('clear server test data', function () {
        editSite('digitall', { serverName: 'localhost' })
    })

    it('Add a first basic vanity URL on a file', function () {
        // vanity url is created, a direct access allows to download the file
        cy.request(Cypress.env('JAHIA_URL') + '/vanityFileToRemove').then((response) => {
            expect(response.status).to.eq(200)
            const mime = response.headers['content-type']
            expect(mime).to.contains('image/jpeg')
            const length = response.headers['content-length']
            expect(length).to.eq('83342')
        })

        cy.login()

        JContent.visit('digitall', 'en', jcontentFilePath)

        new JContent().switchToListMode()
        new JContent().editComponentByText(fileName)

        const contentEditor = new ContentEditorSEO()

        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.deleteVanityUrl('/vanityFileToRemove')

        publishAndWaitJobEnding(sitePath + filePath + fileName)

        // vanity url is deleted, a direct access should triggers a 404 error
        cy.request({
            method: 'GET',
            url: Cypress.env('JAHIA_URL') + '/vanityFileToRemove',
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(404)
        })

        // Check direct access to the file's url still works
        cy.request(Cypress.env('JAHIA_URL') + '/files/live' + sitePath + filePath + fileName).then((response) => {
            expect(response.status).to.eq(200)
            const mime = response.headers['content-type']
            expect(mime).to.contains('image/jpeg')
            const length = response.headers['content-length']
            expect(length).to.eq('83342')
        })
    })
})
