import {BaseComponent, getComponentBySelector} from '@jahia/cypress'
import {VanityUrlLiveRow} from "./VanityUrlLiveRow";

export class LiveVanityUrlList extends BaseComponent {
    static defaultSelector = 'table > tbody[data-vud-table-body-live]'

    getVanityUrlRow(vanityValue: string) {
        return getComponentBySelector(VanityUrlLiveRow, `tr:has(td:contains('${vanityValue}'))`, this)
    }
}
