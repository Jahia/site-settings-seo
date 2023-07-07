import { BasePage } from '@jahia/cypress'
import IframeOptions = Cypress.IframeOptions
import {ContentEditor} from "../ContentEditor";

export enum ExportType {
    XML = 'Export XML',
    ZIP = 'Export Zip',
    ZIP_LIVE = 'Export Zip with live content',
}
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
        return new ContentEditor()
    }

    execute(action: string): Cypress.Chainable {
        cy.log('Execute action: ' + action)
        return cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.get(this.contextMenuId).contains(action).click({ force: true })
        })
    }
}
