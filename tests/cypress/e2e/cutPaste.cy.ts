import { CustomPageComposer } from '../page-object/pageComposer/CustomPageComposer'
import { addVanityUrl, getVanityUrl, deleteNode, getNodeByPath } from '@jahia/cypress'
import { addSimplePage } from '../utils/Utils'

describe('Cut and Paste tests with Vanity Urls', () => {
    let pageToCutPath
    before('Enable legacy page composer, add test page', () => {
        cy.apollo({ mutationFile: 'graphql/enableLegacyPageComposer.graphql' })

        cy.login()
        addSimplePage('/sites/digitall/home', 'to-cut-paste', 'To cut paste', 'en')
            .its('data.jcr.addNode.node.name')
            .then((name) => {
                pageToCutPath = `/sites/digitall/home/${name}`
                addVanityUrl(pageToCutPath, 'en', '/my-vanity')
            })
        cy.logout()
    })

    it('Check for cut and paste', () => {
        cy.login()

        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        let contextMenu = composer.openContextualMenuOnLeftTree('To cut paste')
        contextMenu.cut()
        contextMenu = composer.openContextualMenuOnLeftTree('Newsroom')
        contextMenu.paste()
        cy.waitUntil(
            () => {
                return getNodeByPath('/sites/digitall/home/newsroom/to-cut-paste').then((result) => {
                    if (result?.data) {
                        return result?.data
                    }
                    return false
                })
            },
            {
                errorMsg: 'Node not available in time',
                timeout: 10000,
                interval: 500,
            },
        ).then(() => {
            getVanityUrl('/sites/digitall/home/newsroom/to-cut-paste', ['en']).then((result) => {
                expect(result?.data?.jcr?.nodeByPath?.vanityUrls[0].url).to.eq('/my-vanity')
            })
        })
        deleteNode('/sites/digitall/home/newsroom/to-cut-paste')
        cy.logout()
    })
})
