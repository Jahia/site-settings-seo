import { PageComposer } from '@jahia/content-editor-cypress/dist/page-object/pageComposer'
import { PageComposerContextualMenu } from './pageComposer/pageComposerContextualMenu'
import 'cypress-wait-until'

export class CustomPageComposer extends PageComposer {
    openContextualMenuOnContent(selector: string | number | symbol) {
        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.waitUntil(
                () => {
                    cy.iframe('.gwt-Frame', this.iFrameOptions).within(() => {
                        cy.get(selector).rightclick({ force: true })
                    })
                    return cy.get('.editModeContextMenu').then((element) => expect(element).to.be.not.null)
                },
                {
                    errorMsg: 'Menu not opened in required time',
                    timeout: 10000,
                    interval: 1000,
                },
            )
        })

        return new PageComposerContextualMenu('.editModeContextMenu')
    }

    openContextualMenuOnLeftTree(entry: string) {
        cy.log('Open contextual manu on ' + entry + ' entry')

        cy.iframe('#page-composer-frame', this.iFrameOptions).within(() => {
            cy.waitUntil(
                () => {
                    cy.get('#JahiaGxtPagesTab').contains(entry).rightclick({ force: true })
                    return cy.get('.pagesContextMenuAnthracite').then((element) => expect(element).to.be.not.null)
                },
                {
                    errorMsg: 'Menu not opened in required time',
                    timeout: 10000,
                    interval: 1000,
                },
            )
        })
        return new PageComposerContextualMenu('.pagesContextMenuAnthracite')
    }
}
