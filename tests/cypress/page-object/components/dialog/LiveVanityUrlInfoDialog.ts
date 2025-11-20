import { BaseComponent } from '@jahia/cypress'

export class LiveVanityUrlInfoDialog extends BaseComponent {
    static defaultSelector = 'div[role="dialog"][class*="src-javascript-components-VanityList-live-InfoDialog__dialogRoot"]'

    getTitle() {
        return this.get()
            .find('#alert-dialog-title p')
            .invoke('text')
            .then(t => t.trim())
    }

    getMessage() {
        return this.get()
            .find('#alert-dialog-description p')
            .invoke('text')
            .then(t => t.trim())
    }

    close() {
        this.get()
            .find('button span').contains('OK')
            .parents('button')
            .click()
    }
}
