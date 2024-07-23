import { BaseComponent, getComponent, getComponentByRole } from '@jahia/cypress'
import { Picker } from '@jahia/jcontent-cypress/dist/page-object/picker'
import { PublicationValidationDialog } from '../components/dialog/PublicationValidationDialog'
import { DeleteDialog } from '@jahia/jcontent-cypress/dist/page-object/deleteDialog'

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

    getDeleteButton() {
        return this.get().find('[data-sel-role="delete"]')
    }

    clickOnDelete(): DeleteDialog {
        this.getDeleteButton().click()
        return getComponent(DeleteDialog)
    }

    getPublishButton() {
        return this.get().find('[data-sel-role="publishVanity"]')
    }

    clickOnPublish() {
        this.getPublishButton().click()
        return getComponent(PublicationValidationDialog)
    }
}
