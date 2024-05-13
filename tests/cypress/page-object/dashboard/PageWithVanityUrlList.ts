import { BaseComponent } from '@jahia/cypress'

export class PageWithVanityUrlList extends BaseComponent {
    static defaultSelector = '[data-sel-role="pages-with-vanity"]'

    items() {
        return this.get().find('[data-sel-role="page-card"]')
    }
}
