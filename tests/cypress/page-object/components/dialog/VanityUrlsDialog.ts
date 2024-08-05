import { PageWithVanityUrlList } from '../../dashboard/PageWithVanityUrlList'

export class VanityUrlsDialog extends PageWithVanityUrlList {
    static defaultSelector = '[data-sel-role="manage-vanity-url-dialog"]'

    getPublishAllButton() {
        return this.get().find('[data-sel-role="publish-all-vanitys"]')
    }
}
