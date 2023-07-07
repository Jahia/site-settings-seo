import { BasePage } from '@jahia/cypress'
import { VanityUrlUi } from './VanityUrlUi'
import IframeOptions = Cypress.IframeOptions

export class ContentEditor extends BasePage {
    iFrameOptions: IframeOptions
    contextMenuId: string

    constructor() {
        super()
    }

    openVanityUrlUi() {
        cy.get('button[data-sel-role="3dotsMenuAction"]').click()
        cy.get('li[data-sel-role="vanityUrls"]').click()
        return new VanityUrlUi()
    }
}
