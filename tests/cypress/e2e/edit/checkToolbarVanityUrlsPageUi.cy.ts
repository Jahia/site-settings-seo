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

    it("Verify that the toolbar is closed after permanently deleting a page's list of vanity URLs.", function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.openPageVanityUrlsList('Home')
        vanityUrlsPage.triggerAllCheckbox('Home')
        vanityUrlsPage.deleteFromToolbar()
        vanityUrlsPage.clickOnDeleteFromDialog()
        // We need to wait for the React component to render the list of vanity urls of the previously opened page
        // TODO remove the wait when ticket QA-14972 closed
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000)
        vanityUrlsPage.triggerAllCheckbox('Home')
        vanityUrlsPage.deletePermanentlyFromToolbar()
        vanityUrlsPage.clickOnDeletePermanentlyFromDialog()
        vanityUrlsPage.verifyToolbarStatus(false)
        cy.logout()
    })
})
