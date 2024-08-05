import { BaseComponent, getComponent } from '@jahia/cypress'
import { Menu } from './Menu'

export class AddVanityUrl extends BaseComponent {
    static defaultSelector = '[data-sel-role="new-vanity-url"]'

    fillVanityValues(vanityValue: string, canonical = false, language = 'en', disabled = false) {
        if (canonical) {
            this.get().get('span[data-vud-role="default"]').find('input').click()
        }
        if (vanityValue) {
            this.get().get('input[data-sel-role="vanity-input-text"]').type(vanityValue)
        }

        this.get().get('div[data-sel-role="new-vanity-url"]').find('div[data-sel-role="vanity-language-menu"]').click()
        this.get()
            .get('div[data-sel-role="new-vanity-url"]')
            .find('li[data-sel-value="' + language + '"]')
            .click()

        if (disabled) {
            this.get()
                .get('div[data-sel-role="manage-vanity-url-dialog"]')
                .find('button[data-vud-role="button-primary"]')
                .should('be.disabled')
        } else {
            this.get()
                .get('div[data-sel-role="manage-vanity-url-dialog"]')
                .find('button[data-vud-role="button-primary"]')
                .click()
        }
    }
}
