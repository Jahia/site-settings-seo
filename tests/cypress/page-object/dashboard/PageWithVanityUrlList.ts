import { BaseComponent, getComponentBySelector } from '@jahia/cypress'
import { PageCard } from '../components/PageCard'

export class PageWithVanityUrlList extends BaseComponent {
    static defaultSelector = '[data-sel-role="pages-with-vanity"]'

    items() {
        return this.get().find('[data-sel-role="page-card"]')
    }

    getPageCard(contentUuid: string) {
        return getComponentBySelector(PageCard, `[data-vud-content-uuid="${contentUuid}"]`, this)
    }

}
