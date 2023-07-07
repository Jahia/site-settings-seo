import { publishAndWaitJobEnding, deleteNode, getNodeByPath } from '@jahia/cypress'
import { CustomPageComposer } from './page-object/pageComposerOverride'

describe("Basic tests of the module's seo filter", () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageVanityUrl1 = 'page1'
    const pageVanityUrl2 = 'page2'

    const createPage = (parent: string, name: string, template: string) => {
        cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: 'en',
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
    }

    before('create test data', function () {
        createPage(homePath, pageVanityUrl1, 'home')
        createPage(homePath, pageVanityUrl2, 'home')
        publishAndWaitJobEnding(homePath)
    })

    after('clear test data', function () {
        deleteNode(homePath + '/' + pageVanityUrl1)
        deleteNode(homePath + '/' + pageVanityUrl2)
        publishAndWaitJobEnding(homePath)
    })

    it('Add a first basic vanity URL from the UI', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl1)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addFirstVanityUr('vanity1')

        // eslint-disable-next-line
        cy.wait(500)
        // Check the vanity url is not published by default
        getNodeByPath(
            homePath + '/' + pageVanityUrl1 + '/vanityUrlMapping/vanity1',
            ['j:default'],
            'en',
            [],
            'LIVE',
        ).then((result) => {
            expect(result?.data).eq(undefined)
        })
        // Check it is not canonical by default
        vanityUrlUi.getVanityUrlRow('/vanity1').then((result) => {
            expect(result.text()).not.contains('Canonical')
        })
        getNodeByPath(
            homePath + '/' + pageVanityUrl1 + '/vanityUrlMapping/vanity1',
            ['j:default'],
            'en',
            [],
            'EDIT',
        ).then((result) => {
            expect(result?.data).not.eq(undefined)
            expect(result?.data?.jcr.nodeByPath.name).eq('vanity1')
            expect(result?.data?.jcr.nodeByPath.properties[0].name).eq('j:default')
            expect(result?.data?.jcr.nodeByPath.properties[0].value).eq('false')
        })
    })

    it('Add a first canonical and published vanity URL from the UI', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl2)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addFirstVanityUr('vanity2', true)

        // eslint-disable-next-line
        cy.wait(500)

        // Check the vanity url is not published by default
        getNodeByPath(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/vanity2',
            ['j:default'],
            'en',
            [],
            'LIVE',
        ).then((result) => {
            expect(result?.data).eq(undefined)
        })
        // Check it is canonical
        vanityUrlUi.getVanityUrlRow('/vanity2').then((result) => {
            expect(result.text()).contains('Canonical')
        })
        getNodeByPath(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/vanity2',
            ['j:default'],
            'en',
            [],
            'EDIT',
        ).then((result) => {
            expect(result?.data).not.eq(undefined)
            expect(result?.data?.jcr.nodeByPath.name).eq('vanity2')
            expect(result?.data?.jcr.nodeByPath.properties[0].name).eq('j:default')
            expect(result?.data?.jcr.nodeByPath.properties[0].value).eq('true')
        })

        // Publish the vanity url
        vanityUrlUi.publishAllVanityUrls()

        // Check the vanity url is not published and still canonical
        getNodeByPath(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/vanity2',
            ['j:default'],
            'en',
            [],
            'LIVE',
        ).then((result) => {
            expect(result?.data).not.eq(undefined)
            expect(result?.data?.jcr.nodeByPath.name).eq('vanity2')
            expect(result?.data?.jcr.nodeByPath.properties[0].name).eq('j:default')
            expect(result?.data?.jcr.nodeByPath.properties[0].value).eq('true')
        })
    })
})
