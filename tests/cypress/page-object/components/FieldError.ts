import { BaseComponent } from '@jahia/cypress'

export class FieldError extends BaseComponent {
    static defaultSelector = 'error'

    getLabel() {
        return this.get().find('label')
    }

    getErrorMessage() {
        return this.get().find('message')
    }
}
