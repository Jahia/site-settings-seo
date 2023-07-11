import { CustomPageComposer } from '../../page-object/CustomPageComposer'
import { addVanityUrl, deleteNode } from '@jahia/cypress'
import { addSimplePage } from '../../utils/Utils'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'

describe('Add or edit vanity Urls', () => {
    it('Should display vanity url UI event if parent have special characters', () => {
        cy.login()
        addSimplePage('/sites/digitall/home', 'Chocolate, sweets, cakes', 'Chocolate, sweets, cakes', 'en').then(() => {
            addVanityUrl(
                '/sites/digitall/home/Chocolate, sweets, cakes',
                'en',
                '/test-vanity-url-page-special-character',
            )
        })

        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const composer = new CustomPageComposer()
        composer.editPage('Chocolate, sweets, cakes')
        const contentEditorSEO = new ContentEditorSEO()
        const vanityUrlsUi = contentEditorSEO.openVanityUrlUi()
        vanityUrlsUi.getVanityUrlRow('/test-vanity-url-page-special-character').then((value) => {
            expect(value.text()).to.contains('/test-vanity-url-page-special-character')
        })
        deleteNode('/sites/digitall/home/Chocolate, sweets, cakes')
        cy.logout()
    })
})
