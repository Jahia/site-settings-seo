import { BaseComponent } from '@jahia/cypress'

export class SearchBar extends BaseComponent {
    static defaultSelector = 'input[type="text"]'

    search(term: string) {
        this.get().clear().type(term)
        return this
    }

    clear() {
        this.get().clear()
        return this
    }
}
