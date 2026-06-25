import { BaseComponent, getComponent } from '@jahia/cypress'
import { Menu } from './Menu'
import { FieldError } from './FieldError'

export class VanityUrlRow extends BaseComponent {
    openContextualMenu() {
        this.get().find('button[data-sel-role="vanityListMenu"]').click()
        return getComponent(Menu)
    }

    edit(value: string) {
        const selector = 'input[data-sel-role="vanity-input-text"]'
        this.get().find(selector).clear()
        this.get().find(selector).type(`${value}{enter}`)
    }

    clickToEdit() {
        this.get().find('p[data-vud-role="url"]').click()
    }

    select() {
        this.get().find('input[data-sel-role="select-vanity"]').click()
    }

    getMarkForDeletionBadge() {
        return this.get().find('div[data-sel-role="deletion-badge"]')
    }

    getCanonicalBadge() {
        return this.get().find('div[data-sel-role="canonical-badge"]')
    }

    getActiveSwitch() {
        return this.get().find('[data-vud-role="action-active"] input')
    }

    toggleActive() {
        this.get().find('[data-vud-role="action-active"] input').click()
    }

    changeLanguage(languageCode: string) {
        this.get().find('[data-sel-role="vanity-language-menu"]').click()
        cy.get(`li[data-sel-value="${languageCode}"]`).click()
    }

    getError() {
        return getComponent(FieldError, this)
    }
}
