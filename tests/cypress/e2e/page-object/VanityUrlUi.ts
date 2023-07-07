import { BasePage } from '@jahia/cypress'
import IframeOptions = Cypress.IframeOptions

export class VanityUrlUi extends BasePage {
    iFrameOptions: IframeOptions
    contextMenuId: string

    constructor() {
        super()
    }

    addVanityUr(vanityValue: string, canonical = false) {
        // eslint-disable-next-line
        cy.wait(500)

        cy.get('div[data-sel-role="manage-vanity-url-dialog"]').find('button[aria-label="add"]').click()
        cy.get('input[data-sel-role="vanity-input-text"]').type(vanityValue)

        if (canonical) {
            cy.get('span[data-vud-role="default"]').find('input').click()
        }

        cy.get('div[data-sel-role="manage-vanity-url-dialog"]').find('button[data-vud-role="button-primary"]').click()
    }

    publishAllVanityUrls() {
        cy.get('button[data-sel-role*="publish-all-vanitys"]').click()
    }

    getVanityUrlRow(vanityValue: string) {
        return cy.get('tr[data-vud-url="' + vanityValue + '"]', { timeout: 3000 })
    }
}
