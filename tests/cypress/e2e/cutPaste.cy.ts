import { CustomPageComposer } from '../page-object/pageComposer/CustomPageComposer'
import { addVanityUrl, getVanityUrl, deleteNode, getNodeByPath } from '@jahia/cypress'
import { addSimplePage } from '../utils/Utils'

describe('Cut and Paste tests with Vanity Urls', () => {
    let pageToCopyPath
    before('Enable legacy page composer', () => {
        cy.apollo({ mutationFile: 'graphql/enableLegacyPageComposer.graphql' })
    })

    it('Check for cut and paste', () => {
        cy.login()
        addSimplePage('/sites/digitall/home', 'to-copy-paste', 'To copy paste', 'en').then((page) => {
            pageToCopyPath = `/sites/digitall/home/${page.name}`
            addVanityUrl(pageToCopyPath, 'en', '/my-vanity')
        })
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        let contextMenu = composer.openContextualMenuOnLeftTree('To copy paste')
        contextMenu.cut()
        contextMenu = composer.openContextualMenuOnLeftTree('Newsroom')
        contextMenu.paste()
        cy.waitUntil(
            () => {
                return getNodeByPath('/sites/digitall/home/newsroom/to-copy-paste-1').then((result) => {
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
            getVanityUrl('/sites/digitall/home/newsroom/to-copy-paste-1', ['en']).then((result) => {
                expect(result?.data?.jcr?.nodeByPath?.vanityUrls).deep.eq([])
            })
        })
        deleteNode('/sites/digitall/home/newsroom/to-copy-paste-1')
        cy.logout()
    })
})
