import { BaseComponent, getComponentByRole } from '@jahia/cypress'
import { Picker } from '@jahia/jcontent-cypress/dist/page-object/picker'

export class Toolbar extends BaseComponent {
    static defaultSelector = '[data-sel-role="vanity-url-toolbar"]'

    next() {
        this.get().find('[data-jrm-role="table-pagination-button-next-page"]').click()
    }

    getMoveButton() {
        return this.get().find('[data-sel-role="moveVanity"]')
    }

    clickOnMove(): Picker {
        this.getMoveButton().click()
        return getComponentByRole(Picker, 'picker-dialog')
    }
}
