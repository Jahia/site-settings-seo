import { BaseComponent } from '@jahia/cypress'

export class LanguageSelector extends BaseComponent {
    static defaultSelector = '[data-vud-role="language-selector"]'

    open() {
        this.get().click()
        return this
    }

    selectAll() {
        cy.get('[data-vud-role="language-selector-item-all"]').click()
        return this
    }

    selectLanguage(lang: string) {
        cy.get('[data-vud-role="language-selector-item"]').contains(lang).click()
        return this
    }

    close() {
        cy.get('body').click(0, 0)
        return this
    }

    filterByLanguages(...languages: string[]) {
        this.open()
        this.selectAll()
        languages.forEach((lang) => this.selectLanguage(lang))
        this.close()
        return this
    }
}
