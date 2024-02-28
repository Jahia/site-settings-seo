import { publishAndWaitJobEnding, deleteNode, addVanityUrl, setNodeProperty } from '@jahia/cypress'
import { CustomPageComposer } from '../../page-object/pageComposer/CustomPageComposer'
import { addSimplePage, checkVanityUrlByAPI, checkVanityUrlDoNotExistByAPI } from '../../utils/Utils'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'

describe('Add vanity Urls', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageVanityUrl1 = 'page1'
    const pageVanityUrl2 = 'page2'

    before('init', function () {
        cy.apollo({ mutationFile: 'graphql/enableLegacyPageComposer.graphql' })
    })

    beforeEach('create test data', function () {
        addSimplePage(homePath, pageVanityUrl1, pageVanityUrl1, 'en')
        setNodeProperty(homePath + '/' + pageVanityUrl1, 'jcr:title', pageVanityUrl1 + '-fr', 'fr')
        addSimplePage(homePath, pageVanityUrl2, pageVanityUrl2, 'en')
        addVanityUrl('/sites/digitall/home/' + pageVanityUrl2, 'en', '/existingVanity')
        publishAndWaitJobEnding(homePath, ['en', 'fr'])
    })

    afterEach('clear test data', function () {
        deleteNode(homePath + '/' + pageVanityUrl1)
        deleteNode(homePath + '/' + pageVanityUrl2)
        publishAndWaitJobEnding(homePath, ['en', 'fr'])
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

    it.skip('Add a second canonical vanity URL and published vanity URL from the UI', function () {
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

    it('Should display vanity url UI event if parent have special characters', () => {
        cy.login()
        addSimplePage('/sites/digitall/home', '(Chocolate, sweets, cakes)', 'Chocolate, sweets, cakes', 'en').then(
            () => {
                addVanityUrl(
                    '/sites/digitall/home/(Chocolate, sweets, cakes)',
                    'en',
                    '/test-vanity-url-page-special-character',
                )
            },
        )

        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const composer = new CustomPageComposer()
        composer.editPage('Chocolate, sweets, cakes')
        const contentEditorSEO = new ContentEditorSEO()
        const vanityUrlsUi = contentEditorSEO.openVanityUrlUi()
        vanityUrlsUi.getVanityUrlRow('/test-vanity-url-page-special-character').then((value) => {
            expect(value.text()).to.contains('/test-vanity-url-page-special-character')
        })
        deleteNode('/sites/digitall/home/(Chocolate, sweets, cakes)')
        cy.logout()
    })

    it('Add a vanity URL on non default language', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl1)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()

        vanityUrlUi.clickOnAddVanityUrl()

        cy.get('div[data-sel-role="vanity-language-menu"]').then((row) => {
            expect(row.text()).to.contains('en')
            expect(row.text()).not.to.contains('fr')
        })

        vanityUrlUi.fillVanityValues('vanity1fr', false, 'fr')

        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl1 + '/vanityUrlMapping/vanity1fr',
            'vanity1fr',
            'fr',
            'EDIT',
            'false',
        )
    })

    it('Already existing vanity url', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl1)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('existingVanity', false, 'fr')

        vanityUrlUi.getErrorRow().then((result) => {
            expect(result.text()).contains('Already in use')
        })
    })

    it('Add empty vanity url', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl1)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('', false, 'fr', true)

        vanityUrlUi.getErrorRow().then((result) => {
            expect(result.text()).contains('Invalid URL')
        })
    })

    it('Invalid chars in vanity url', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl1)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('bad-url/*', false, 'fr', true)

        vanityUrlUi.getErrorRow().then((result) => {
            expect(result.text()).contains('Characters :*?"<>|%+ are not allowed')
        })
    })

    it('Invalid vanity url with .do', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl1)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('bad-url.do', false, 'fr', true)

        vanityUrlUi.getErrorRow().then((result) => {
            expect(result.text()).contains('URL cannot ends with .do')
        })
    })
})
