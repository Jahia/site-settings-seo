import { ContentEditor } from '@jahia/jcontent-cypress/dist/page-object/contentEditor'
import { VanityUrlUi } from './VanityUrlUi'

export class ContentEditorSEO extends ContentEditor {
    constructor() {
        super()
    }

    openVanityUrlUi() {
        this.open3dotsMenu()
        cy.get('li[data-sel-role="vanityUrls"]').click()
        return new VanityUrlUi()
    }

    open3dotsMenu() {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
    }

    getVanityUrlAction() {
        return cy.get('button[data-sel-role="3dotsMenuAction"]', { timeout: 3000 })
    }
}
