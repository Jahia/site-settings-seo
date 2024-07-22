import { BaseComponent } from '@jahia/cypress'

export class MoveValidationDialog extends BaseComponent {
    static defaultSelector = '[data-sel-role="move-validation-dialog"]'

    move() {
        return this.get().find('[data-sel-role="move"]').click()
    }

    cancel() {
        return this.get().find('[data-sel-role="cancel"]').click()
    }
}
