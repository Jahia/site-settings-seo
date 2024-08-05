import { ContentEditor } from '@jahia/jcontent-cypress/dist/page-object/contentEditor'
import { VanityUrlUi } from './VanityUrlUi'
import { VanityUrlsDialog } from './components/dialog/VanityUrlsDialog'
import {getComponent} from "@jahia/cypress";

export class ContentEditorSEO extends ContentEditor {
    constructor() {
        super()
    }

    openVanityUrlDialog(): VanityUrlsDialog {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').click()
        return getComponent(VanityUrlsDialog)
    }

    openVanityUrlUi(): VanityUrlUi {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').click()
        return new VanityUrlUi()
    }

    checkVanityUrlAccessibility(enabled) {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').should('have.attr', 'aria-disabled', enabled)
    }

    checkVanityUrlVisibility(isVisible) {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').should(isVisible ? 'be.visible' : 'not.be.visible')
    }
}
