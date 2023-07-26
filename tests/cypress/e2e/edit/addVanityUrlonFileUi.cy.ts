import { publishAndWaitJobEnding, editSite } from '@jahia/cypress'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'

import { JContent } from '@jahia/content-editor-cypress/dist/page-object/jcontent'

describe('Add or edit vanity Urls', () => {
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

        switchView('list')
        new JContent().editComponentByText(fileName)

        const contentEditor = new ContentEditorSEO()

        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('vanityFile1', true)

        publishAndWaitJobEnding(sitePath + filePath + fileName)

        cy.request(Cypress.env('JAHIA_URL') + '/vanityFile1').then((response) => {
            // expect(response.body).to.have.length(500)
            const mime = response.headers['content-type']
            expect(mime).to.contains('image/jpeg')
            const length = response.headers['content-length']
            expect(length).to.eq('83342')
        })
    })

    const switchView = (displayMode: 'list' | 'grid') => {
        cy.get('div[data-sel-role="sel-view-mode-dropdown"]').click()
        cy.get('li[data-sel-role="sel-view-mode-' + displayMode + '"]').click()
    }
})
