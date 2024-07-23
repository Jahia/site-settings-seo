import { BaseComponent, getComponent, getComponentByRole } from '@jahia/cypress'
import { Picker } from '@jahia/jcontent-cypress/dist/page-object/picker'
import { DeleteDialog } from '@jahia/jcontent-cypress/dist/page-object/deleteDialog'
import { PublicationValidationDialog } from './dialog/PublicationValidationDialog'

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

    getDeleteButton() {
        return this.get().find('[data-sel-role="delete"]')
    }

    clickOnMove() {
        this.getMoveButton().click()
        return getComponentByRole(Picker, 'picker-dialog')
    }

    clickOnDelete(): DeleteDialog {
        this.getDeleteButton().click()
        return getComponent(DeleteDialog)
    }

    clickOnPublish() {
        this.getPublishButton().click()
        return getComponent(PublicationValidationDialog)
    }
}
