export class VanityUrlsPage {
    elements = {
        pageRowVanityUrls: "div[data-vud-role='content-title'] span",
        allCheckbox:
            "div[class*='src-javascript-components-VanityList-VanityUrlListDefault__allCheckbox'] span span input[type='checkbox']",
        toolBar: "div[class*='src-javascript-components-Toolbar-Toolbar__buttonsBar']",
        deleteDialog: "div[data-sel-role='delete-mark-dialog']",
        deletePermanentlyDialog: "div[data-sel-role='delete-permanently-dialog']",
        readOnlyBadge: 'div[data-sel-role="read-only-badge"]',
    }

    static visit(siteKey = 'mySite', lang = 'en') {
        cy.visit(`/jahia/jcontent/${siteKey}/${lang}/apps/siteSettingsSeo/VanityUrls`)
        return new VanityUrlsPage()
    }

    findPageRow(page: string) {
        return cy.get(this.elements.pageRowVanityUrls).contains(page)
    }

    findReadOnlyBadge(page: string) {
        return cy
            .get(this.elements.pageRowVanityUrls)
            .contains(page)
            .parent()
            .parent()
            .find(this.elements.readOnlyBadge)
    }

    openPageVanityUrlsList(page: string) {
        this.findPageRow(page).click()
    }

    triggerAllCheckbox(page: string) {
        this.findPageRow(page).parent().parent().parent().find(this.elements.allCheckbox).eq(0).check()
    }

    deleteFromToolbar() {
        this.clickOnButton(this.elements.toolBar, 'delete')
    }

    deletePermanentlyFromToolbar() {
        this.clickOnButton(this.elements.toolBar, 'deletePermanently')
    }

    clickOnDeleteFromDialog() {
        this.clickOnButton(this.elements.deleteDialog, 'delete-mark-button')
    }

    clickOnDeletePermanentlyFromDialog() {
        this.clickOnButton(this.elements.deletePermanentlyDialog, 'delete-permanently-button')
    }

    clickOnButton(toolBarButtonSelector: string, buttonRole: string) {
        cy.get(toolBarButtonSelector)
            .eq(0)
            .find('button[data-sel-role=' + buttonRole + ']')
            .click()
    }

    verifyToolbarStatus(shouldBeOpen = true) {
        if (shouldBeOpen) {
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
