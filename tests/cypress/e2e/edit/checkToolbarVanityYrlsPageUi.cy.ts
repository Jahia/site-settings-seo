import { addVanityUrl } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Check toolbar comportment from Vanity Urls page UI', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const vanityUrl1 = 'vanityurltesten'
    const vanityUrl2 = 'vanityurltestfr'

    before('create test data', function () {
        addVanityUrl(homePath, 'en', vanityUrl1)
        addVanityUrl(homePath, 'fr', vanityUrl2)
    })

    it('Check toolbar comportment on delete permanently vanities', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList('Home')
        vanityUrlsPage.selectAllVanityUrls()
        vanityUrlsPage.clickOnToolbarTargetButton('delete')
        vanityUrlsPage.clickOnDeleteDialogTargetButton('delete-mark-button')
        // Need to wait refresh render react component
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
        vanityUrlsPage.selectAllVanityUrls()
        vanityUrlsPage.clickOnToolbarTargetButton('deletePermanently')
        vanityUrlsPage.clickOnDeletePermanentlyDialogTargetButton('delete-permanently-button')
        vanityUrlsPage.toolbarShouldBeOpen(false)
    })
})
