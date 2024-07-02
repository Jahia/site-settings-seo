import { BaseComponent } from '@jahia/cypress'

export class Menu extends BaseComponent {
    static defaultSelector = '[data-sel-role="jcontent-vanityListMenu"]'

    getPublishButton() {
        return this.get().find('[data-sel-role="publish-vanity"]')
    }
}
