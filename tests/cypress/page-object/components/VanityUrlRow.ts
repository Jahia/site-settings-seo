import { BaseComponent, getComponent } from '@jahia/cypress'
import { Menu } from './Menu'

export class VanityUrlRow extends BaseComponent {
    openContextualMenu() {
        this.get().find('button[data-sel-role="vanityListMenu"]').click()
        return getComponent(Menu)
    }
}
