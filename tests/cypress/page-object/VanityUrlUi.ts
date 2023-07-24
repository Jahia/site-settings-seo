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

    startAddvanityUrl() {
        // eslint-disable-next-line
        cy.wait(500)

        cy.get('div[data-sel-role="manage-vanity-url-dialog"]').find('button[aria-label="add"]').click()
    }

    enterVanityUrlValues(vanityValue: string, canonical = false, language = 'en') {
        cy.get('input[data-sel-role="vanity-input-text"]').type(vanityValue)

        if (canonical) {
            cy.get('span[data-vud-role="default"]').find('input').click()
        }

        cy.get('tr[data-sel-role="new-vanity-url"]').find('div[data-sel-role="vanity-language-menu"]').click()
        cy.get('tr[data-sel-role="new-vanity-url"]')
            .find('li[data-sel-value="' + language + '"]')
            .click()

        cy.get('div[data-sel-role="manage-vanity-url-dialog"]').find('button[data-vud-role="button-primary"]').click()
    }

    addVanityUrl(vanityValue: string, canonical = false, language = 'en') {
        this.startAddvanityUrl()
        this.enterVanityUrlValues(vanityValue, canonical, language)
    }

    publishAllVanityUrls() {
        cy.get('button[data-sel-role*="publish-all-vanitys"]').click()
    }

    getVanityUrlRow(vanityValue: string) {
        return cy.get('tr[data-vud-url="' + vanityValue + '"]', { timeout: 3000 })
    }
}
