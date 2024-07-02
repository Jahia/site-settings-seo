import { BaseComponent, getComponent } from '@jahia/cypress'
import { StagingVanityUrlList } from './StagingVanityUrlList'

export class PageCard extends BaseComponent {
    static defaultSelector = '[data-sel-role="page-card"]'

    open() {
        this.get().click()
    }

    getPublishAllButton() {
        return this.get().find('[data-sel-role="publish-all-vanitys"]')
    }

    getStagingVanityUrls() {
        return getComponent(StagingVanityUrlList, this)
    }
}
