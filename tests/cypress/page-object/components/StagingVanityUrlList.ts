import { BaseComponent, getComponentBySelector } from '@jahia/cypress'
import { VanityUrlRow } from './VanityUrlRow'

export class StagingVanityUrlList extends BaseComponent {
    static defaultSelector = '[data-sel-role="vanity-url-list"]'

    getVanityUrlRow(vanityValue: string) {
        return getComponentBySelector(VanityUrlRow, `tr[data-vud-url="${vanityValue}"]`, this)
    }
}
