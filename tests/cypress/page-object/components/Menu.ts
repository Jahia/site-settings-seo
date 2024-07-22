import { BaseComponent, getComponentByRole } from '@jahia/cypress'
import { Picker } from '@jahia/jcontent-cypress/dist/page-object/picker'

export class Menu extends BaseComponent {
    static defaultSelector = '[data-sel-role="jcontent-vanityListMenu"]'

    getPublishButton() {
        return this.get().find('[data-sel-role="publishVanity"]')
    }

    getRequestPublicationButton() {
        return this.get().find('[data-sel-role="publishVanity"]').contains('Request publication')
    }

    getUnpublishButton() {
        return this.get().find('[data-sel-role="unpublish"]')
    }

    getMoveButton() {
        return this.get().find('[data-sel-role="moveVanity"]')
    }

    clickOnMove() {
        this.getMoveButton().click()
        return getComponentByRole(Picker, 'picker-dialog')
    }
}
