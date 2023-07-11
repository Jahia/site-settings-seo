import { publishAndWaitJobEnding, deleteNode, getNodeByPath, addVanityUrl } from '@jahia/cypress'
import { CustomPageComposer } from './page-object/pageComposerOverride'
import { addSimplePage } from '../utils/Utils'

describe("Basic tests of the module's seo filter", () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageVanityUrl1 = 'page1'
    const pageVanityUrl2 = 'page2'

    const checkVanityUrlByAPI = (
        vanityUrlPath: string,
        vanityUrlName: string,
        language: string,
        workspace: 'EDIT' | 'LIVE' = 'EDIT',
        isCanonical: string,
    ) => {
        getNodeByPath(vanityUrlPath, ['j:default'], language, [], workspace).then((result) => {
            expect(result?.data).not.eq(undefined)
            expect(result?.data?.jcr.nodeByPath.name).eq(vanityUrlName)
            expect(result?.data?.jcr.nodeByPath.properties[0].name).eq('j:default')
            expect(result?.data?.jcr.nodeByPath.properties[0].value).eq(isCanonical)
        })
    }

    const checkVanityUrlDoNotExistByAPI = (
        vanityUrlPath: string,
        language: string,
        workspace: 'EDIT' | 'LIVE' = 'EDIT',
    ) => {
        // eslint-disable-next-line
        cy.wait(500)

        getNodeByPath(vanityUrlPath, [], language, [], workspace).then((result) => {
            expect(result?.data).eq(undefined)
        })
    }

    before('create test data', function () {
        addSimplePage(homePath, pageVanityUrl1, pageVanityUrl1, 'en')
        addSimplePage(homePath, pageVanityUrl2, pageVanityUrl2, 'en')
        addVanityUrl('/sites/digitall/home/' + pageVanityUrl2, 'en', '/existingVanity')
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
        vanityUrlUi.addVanityUrl('vanity1')

        // Check the vanity url is not published by default (it does not exists in LIVE)
        checkVanityUrlDoNotExistByAPI(homePath + '/' + pageVanityUrl1 + '/vanityUrlMapping/vanity1', 'en', 'LIVE')
        // Check it is not canonical by default
        vanityUrlUi.getVanityUrlRow('/vanity1').then((result) => {
            expect(result.text()).not.contains('Canonical')
        })
        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl1 + '/vanityUrlMapping/vanity1',
            'vanity1',
            'en',
            'EDIT',
            'false',
        )
    })

    it('Add a second canonical vanity URL and published vanity URL from the UI', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl2)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('vanity2', true)

        // Check the vanity url is not published by default (= does not exists in LIVE)
        checkVanityUrlDoNotExistByAPI(homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/vanity2', 'en', 'LIVE')

        // Check it is canonical
        vanityUrlUi.getVanityUrlRow('/vanity2').then((result) => {
            expect(result.text()).contains('Canonical')
        })

        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/vanity2',
            'vanity2',
            'en',
            'EDIT',
            'true',
        )

        // Check first vanity url is not canonical
        vanityUrlUi.getVanityUrlRow('/existingVanity').then((result) => {
            expect(result.text()).not.contains('Canonical')
        })
        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/existingVanity',
            'existingVanity',
            'en',
            'EDIT',
            'false',
        )

        // Publish the vanity url
        vanityUrlUi.publishAllVanityUrls()

        // Check the vanity url is now published and still canonical
        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/vanity2',
            'vanity2',
            'en',
            'LIVE',
            'true',
        )
        // Check first vanity url is not canonical
        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/existingVanity',
            'existingVanity',
            'en',
            'LIVE',
            'false',
        )
    })
})