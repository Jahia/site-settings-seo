import { ContentEditor } from '@jahia/jcontent-cypress/dist/page-object/contentEditor'
import { VanityUrlUi } from './VanityUrlUi'

export class ContentEditorSEO extends ContentEditor {
    constructor() {
        super()
    }

    openVanityUrlUi() {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').click()
        return new VanityUrlUi()
    }

    checkVanityUrlAccessibility(enabled) {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').should('have.attr', 'aria-disabled', enabled)
    }

    checkVanityUrlAccess(isVisible) {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        if (isVisible) {
            cy.get('li[data-sel-role="vanityUrls"]').should('be.visible')
        } else {
            cy.get('li[data-sel-role="vanityUrls"]').should('not.be.visible')
        }
    }
}
