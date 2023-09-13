export class VanityUrlsPage {
    elements = {
        pageRowVanityUrls: "div[data-vud-role='content-title'] span",
        allCheckbox:
            "div[class*='src-javascript-components-VanityList-VanityUrlListDefault__allCheckbox'] span span input[type='checkbox']",
        toolBar: "div[class*='src-javascript-components-Toolbar-Toolbar__buttonsBar']",
        deleteDialog: "div[data-sel-role='delete-mark-dialog']",
        deletePermanentlyDialog: "div[data-sel-role='delete-permanently-dialog']",
    }

    static visit(siteKey = 'mySite', lang = 'en') {
        cy.visit(`/jahia/jcontent/${siteKey}/${lang}/apps/siteSettingsSeo/VanityUrls`)
        return new VanityUrlsPage()
    }

    openPageVanityUrlsList(page) {
        cy.get(this.elements.pageRowVanityUrls).contains(page).click()
    }

    selectAllVanityUrls() {
        cy.get(this.elements.allCheckbox).eq(0).check()
    }

    clickOnToolbarTargetButton(buttonRole) {
        cy.get(this.elements.toolBar)
            .eq(0)
            .find('button[data-sel-role=' + buttonRole + ']')
            .click()
    }

    clickOnDeleteDialogTargetButton(buttonRole) {
        cy.get(this.elements.deleteDialog)
            .eq(0)
            .find('button[data-sel-role=' + buttonRole + ']')
            .click()
    }

    clickOnDeletePermanentlyDialogTargetButton(buttonRole) {
        cy.get(this.elements.deletePermanentlyDialog)
            .eq(0)
            .find('button[data-sel-role=' + buttonRole + ']')
            .click()
    }

    toolbarShouldBeOpen(check = true) {
        if (check) {
            cy.get(this.elements.toolBar).should(($el) => {
                const isVisible = $el.is('visible')
                expect(isVisible, 'is visible').to.be.true
            })
        } else {
            cy.get(this.elements.toolBar).should(($el) => {
                const isNotVisible = !$el.is('visible')
                expect(isNotVisible, 'is not visible').to.be.true
            })
        }
    }
}
