import { BaseComponent } from '@jahia/cypress'

export class LiveVanityUrlInfoDialog extends BaseComponent {
    static defaultSelector = 'div[class*="VanityList-live-InfoDialog__dialogContent"]'

    getTitle() {
        return this.get().find('p[class*="VanityList-live-InfoDialog__dialogTitle"]').invoke('text')
    }

    getMessage() {
        return this.get().find('div[id="alert-dialog-description"] p[class*="VanityList-live-InfoDialog__label"]').invoke('text')
    }

    close() {
        this.get().parents('div').find('button[type="button"] span').contains('OK').parents('button').click()
    }
}
