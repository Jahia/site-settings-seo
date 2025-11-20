import { getComponent } from '@jahia/cypress'
import { PageWithVanityUrlList } from './dashboard/PageWithVanityUrlList'
import { Pagination } from './dashboard/Pagination'
import { Toolbar } from './dashboard/Toolbar'
import { StagingVanityUrlList } from './components/StagingVanityUrlList'
export class VanityUrlsPage {
    elements = {
        pageRowVanityUrls: "div[data-vud-role='content-title'] span",
        allCheckbox:
            "div[class*='src-javascript-components-VanityList-VanityUrlListDefault__allCheckbox'] span span input[type='checkbox']",
        toolBar: "div[class*='src-javascript-components-Toolbar-Toolbar__buttonsBar']",
        deleteDialog: "div[data-sel-role='delete-mark-dialog']",
        deletePermanentlyDialog: "div[data-sel-role='delete-permanently-dialog']",
        readOnlyBadge: 'div[data-sel-role="read-only-badge"]',
        workspaceDropdown: '#workspaceDropdown',
        workspaceDropdownLabel: '#workspaceDropdown .moonstone-dropdown_label',
    }

    static visit(siteKey = 'mySite', lang = 'en') {
        cy.visit(`/jahia/jcontent/${siteKey}/${lang}/apps/siteSettingsSeo/VanityUrls`)
        return new VanityUrlsPage()
    }

    findPageRow(page: string) {
        return cy.get(this.elements.pageRowVanityUrls).contains(page)
    }

    findVanityUrlsTable(contentId: string) {
        return cy.get(`tbody[data-vud-table-body-default="${contentId}"]`)
    }

    getStagingVanityUrlList(): StagingVanityUrlList {
        return getComponent(StagingVanityUrlList)
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

    getPagesWithVanityUrl(): PageWithVanityUrlList {
        return getComponent(PageWithVanityUrlList)
    }

    getPagination(): Pagination {
        return getComponent(Pagination)
    }

    getToolbar(): Toolbar {
        return getComponent(Toolbar)
    }

    switchToStagingAndLiveMode() {
        this.switchToMode('Staging and live')
    }

    switchToStagingMode() {
        this.switchToMode('Staging vanity URLs')
    }

    switchToLiveMode() {
        this.switchToMode('Live vanity URLs')
    }

    private switchToMode(mode: string) {
        cy.get(this.elements.workspaceDropdown).click()
        cy.get('[role="option"]').contains(mode).click()
        cy.get(this.elements.workspaceDropdownLabel).should('have.text', mode)
    }

    getCurrentMode() {
        return cy.get(this.elements.workspaceDropdownLabel)
    }

    verifyCurrentMode(expectedMode: string) {
        cy.get(this.elements.workspaceDropdownLabel).should('have.text', expectedMode)
    }
}
