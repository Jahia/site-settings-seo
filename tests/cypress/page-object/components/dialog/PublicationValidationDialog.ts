import { BaseComponent } from '@jahia/cypress'

export class PublicationValidationDialog extends BaseComponent {
    static defaultSelector = '[data-sel-role="publication-validation-dialog"]'

    publish() {
        return this.get().find('[data-sel-role="publish"]').click()
    }

    cancel() {
        return this.get().find('[data-sel-role="cancel"]').click()
    }
}
