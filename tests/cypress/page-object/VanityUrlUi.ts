import { BasePage } from '@jahia/cypress'

export class VanityUrlUi extends BasePage {
    constructor() {
        super()
    }

    getErrorRow() {
        return cy.get('error', { timeout: 500 })
    }
    getNewVanityUrlRow() {
        return cy.get('tr[data-sel-role="new-vanity-url"]', { timeout: 500 })
    }

    addVanityUrl(vanityValue: string, canonical = false, language = 'en') {
        // eslint-disable-next-line
        cy.wait(500)

        cy.get('div[data-sel-role="manage-vanity-url-dialog"]').find('button[aria-label="add"]').click()
        cy.get('input[data-sel-role="vanity-input-text"]').type(vanityValue)

        if (canonical) {
            cy.get('span[data-vud-role="default"]').find('input').click()
        }

        // We do not select manually language = 'en' as it is the default language
        if ('en' != language) {
            cy.get('div[data-sel-role="vanity-language-menu"]').click()
            cy.get('li[data-sel-value="' + language + '"]').click()
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
