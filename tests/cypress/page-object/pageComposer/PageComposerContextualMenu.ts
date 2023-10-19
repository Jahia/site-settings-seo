import { BasePage } from '@jahia/cypress'
import { ContentEditorSEO } from '../ContentEditorSEO'
import IframeOptions = Cypress.IframeOptions

export class PageComposerContextualMenu extends BasePage {
    iFrameOptions: IframeOptions
    contextMenuId: string

    constructor(contextMenuId: string) {
        super()
        this.contextMenuId = contextMenuId
    }

    copy(): Cypress.Chainable {
        return this.execute('Copy')
    }

    cut(): Cypress.Chainable {
        return this.execute('Cut')
    }

    paste(): Cypress.Chainable {
        return this.execute('Paste')
    }

    edit() {
        this.execute('Edit')
        return new ContentEditorSEO()
    }

    execute(action: string): Cypress.Chainable {
        cy.log('Execute action: ' + action)
        return cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get(this.contextMenuId).contains(action).click({ force: true })
        })
    }
}
