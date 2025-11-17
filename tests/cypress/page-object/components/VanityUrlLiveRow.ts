import { BaseComponent, getComponent } from '@jahia/cypress'
import { LiveVanityUrlInfoDialog } from './dialog/LiveVanityUrlInfoDialog'

export class VanityUrlLiveRow extends BaseComponent {
    isCanonical() {
        return this.get()
            .find('td:nth-child(2)')
            .then(($td) => {
                if ($td.children().length === 0) {
                    return false
                }
                return $td.text().includes('Canonical')
            })
    }

    getLanguage() {
        return this.get().find('td:nth-child(3)').invoke('text')
    }

    containsInfo() {
        return this.get()
            .find('td:nth-child(4)')
            .then(($td) => {
                if ($td.children().length === 0) {
                    return false
                }
                return $td.find('button').length > 0
            })
    }

    displayInfo() {
        const button = this.get().find('td:nth-child(4) button')
        button.click()
        return getComponent(LiveVanityUrlInfoDialog)
    }
}
