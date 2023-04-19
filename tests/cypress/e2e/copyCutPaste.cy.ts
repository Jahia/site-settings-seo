import { CustomPageComposer } from './page-object/pageComposerOverride'
import { addVanityUrl, removeVanityUrl, getVanityUrl, deleteNode, moveNode } from '@jahia/cypress'

describe('Copy Cut and Paste tests with Vanity Urls', () => {
    before('Set vanityUrl', () => {
        cy.login()
        addVanityUrl('/sites/digitall/home/about', 'en', '/about')
        cy.logout()
    })

    it('Check for copy and paste (under different parent)', () => {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        let contextMenu = composer.openContextualMenuOnLeftTree('About')
        contextMenu.copy()
        contextMenu = composer.openContextualMenuOnLeftTree('Home')
        contextMenu.paste()
        // eslint-disable-next-line
        cy.wait(7500)
        getVanityUrl('/sites/digitall/home/about-1', ['en']).then((result) => {
            expect(result?.data?.jcr?.nodeByPath?.vanityUrls).deep.eq([])
        })

        deleteNode('/sites/digitall/home/about-1')
        cy.logout()
    })

    it('Check for copy and paste (under different parent)', () => {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        let contextMenu = composer.openContextualMenuOnLeftTree('About')
        contextMenu.copy()
        contextMenu = composer.openContextualMenuOnLeftTree('Newsroom')
        contextMenu.paste()
        // eslint-disable-next-line
        cy.wait(7500)
        getVanityUrl('/sites/digitall/home/newsroom/about', ['en']).then((result) => {
            expect(result?.data?.jcr?.nodeByPath?.vanityUrls).deep.eq([])
        })

        deleteNode('/sites/digitall/home/newsroom/about')
        cy.logout()
    })

    it('Check for cut and paste', () => {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        let contextMenu = composer.openContextualMenuOnLeftTree('About')
        contextMenu.cut()
        contextMenu = composer.openContextualMenuOnLeftTree('Newsroom')
        contextMenu.paste()
        // eslint-disable-next-line
        cy.wait(7500)
        getVanityUrl('/sites/digitall/home/newsroom/about', ['en']).then((result) => {
            expect(result?.data?.jcr?.nodeByPath?.vanityUrls[0].url).to.eq('/about')
        })
        moveNode('/sites/digitall/home/newsroom/about', '/sites/digitall/home')
        cy.logout()
    })

    after('Remove vanityUrl', () => {
        cy.login()
        removeVanityUrl('/sites/digitall/home/about', '/about')
        cy.logout()
    })
})
