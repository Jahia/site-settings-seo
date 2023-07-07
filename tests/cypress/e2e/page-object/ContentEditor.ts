import { BasePage } from '@jahia/cypress'
import IframeOptions = Cypress.IframeOptions
import {VanityUrlUi} from "./VanityUrlUi";


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

    execute(action: string): Cypress.Chainable {
        cy.log('Execute action: ' + action)
        return cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get(this.contextMenuId).contains(action).click({ force: true })
        })
    }
}
