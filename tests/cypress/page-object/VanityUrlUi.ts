import { BasePage } from '@jahia/cypress'

export class VanityUrlUi extends BasePage {
    constructor() {
        super()
    }

    addVanityUrl(vanityValue: string, canonical = false) {
        // eslint-disable-next-line
        cy.wait(500)

        cy.get('div[data-sel-role="manage-vanity-url-dialog"]').find('button[aria-label="add"]').click()
        cy.get('input[data-sel-role="vanity-input-text"]').type(vanityValue)

        if (canonical) {
            cy.get('span[data-vud-role="default"]').find('input').click()
        }

        cy.get('tr[data-sel-role="new-vanity-url"]').find('div[data-sel-role="vanity-language-menu"]').click()
        cy.get('tr[data-sel-role="new-vanity-url"]')
            .find('li[data-sel-value="' + language + '"]')
            .click()

        if (disabled) {
            cy.get('div[data-sel-role="manage-vanity-url-dialog"]')
                .find('button[data-vud-role="button-primary"]')
                .should('be.disabled')
        } else {
            cy.get('div[data-sel-role="manage-vanity-url-dialog"]')
                .find('button[data-vud-role="button-primary"]')
                .click()
        }
    }

    addVanityUrl(vanityValue: string, canonical = false, language = 'en', disabled = false) {
        this.clickOnAddVanityUrl()
        this.fillVanityValues(vanityValue, canonical, language, disabled)
    }

    editVanityUrl(originalVanityValue: string, newVanityValue: string) {
        this.getVanityUrlRow(originalVanityValue).click()
        const selector = 'input[data-sel-role="vanity-input-text"]'
        cy.get(selector).clear()
        cy.get(selector).type(`${newVanityValue}{enter}`)
    }

    deleteVanityUrl(vanityToDelete: string) {
        this.getVanityUrlRow(vanityToDelete).find('button[data-sel-role="vanityListMenu"]').click()
        cy.get('menu[data-sel-role="jcontent-vanityListMenu"]').find('li[data-sel-role="delete"]').click()
        cy.get('button[data-sel-role="delete-mark-button"]').click()
    }

    publishAllVanityUrls() {
        cy.get('button[data-sel-role*="publish-all-vanitys"]').click()
    }

    getVanityUrlRow(vanityValue: string) {
        return cy.get('tr[data-vud-url="' + vanityValue + '"]', { timeout: 3000 })
    }

    findReadOnlyBadge() {
        return cy.get('div[data-sel-role="read-only-badge"]')
    }
}
