import { BaseComponent } from '@jahia/cypress'

export class Pagination extends BaseComponent {
    static defaultSelector = '[data-jrm-role="table-pagination"]'

    next() {
        this.get().find('[data-jrm-role="table-pagination-button-next-page"]').click()
    }
}
