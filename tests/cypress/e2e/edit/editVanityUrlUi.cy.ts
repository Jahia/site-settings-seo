import { publishAndWaitJobEnding, deleteNode, addVanityUrl, setNodeProperty, addNode } from '@jahia/cypress'
import { addSimplePage, checkVanityUrlByAPI, checkVanityUrlDoNotExistByAPI } from '../../utils/Utils'
import { CustomPageComposer } from '../../page-object/pageComposer/CustomPageComposer'
describe('Edit vanity Urls', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageVanityUrl1 = 'page1'
    const pageVanityUrl2 = 'page2'
    const pageVanityUrl1Path = homePath + '/' + pageVanityUrl2
    const pageVanityUrl2Path = homePath + '/' + pageVanityUrl2

    beforeEach('create test data', function () {
        addSimplePage(homePath, pageVanityUrl1, pageVanityUrl1, 'en')
        setNodeProperty(homePath + '/' + pageVanityUrl1, 'jcr:title', pageVanityUrl1 + '-fr', 'fr')
        addSimplePage(homePath, pageVanityUrl2, pageVanityUrl2, 'en')
        setNodeProperty(homePath + '/' + pageVanityUrl2, 'jcr:title', pageVanityUrl2 + '-fr', 'fr')
        addVanityUrl(pageVanityUrl2Path, 'en', '/existingVanity2en')
        addVanityUrl(pageVanityUrl2Path, 'fr', '/existingVanity2fr')

        publishAndWaitJobEnding(homePath, ['en', 'fr'])
    })

    afterEach('clear test data', function () {
        deleteNode(pageVanityUrl1Path)
        deleteNode(pageVanityUrl2Path)
        publishAndWaitJobEnding(homePath, ['en', 'fr'])
    })

    it('Edit vanity URL from the UI', function () {
        cy.login()
        const composer = new CustomPageComposer()
        CustomPageComposer.visit('digitall', 'en', 'home.html')
        const contextMenu = composer.openContextualMenuOnLeftTree(pageVanityUrl2)
        const contentEditor = contextMenu.edit()
        const vanityUrlUi = contentEditor.openVanityUrlUi()
        vanityUrlUi.editVanityUrl('/existingVanity2en', 'renamedVanity2en')
        vanityUrlUi.editVanityUrl('/existingVanity2fr', 'renamedVanity2fr')

        // Check the vanity url has been edited (by api)

        checkVanityUrlDoNotExistByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/existingVanity2en',
            'en',
            'EDIT',
        )
        checkVanityUrlDoNotExistByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/existingVanity2fr',
            'fr',
            'EDIT',
        )

        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/renamedVanity2en',
            'renamedVanity2en',
            'en',
            'EDIT',
            'true',
        )
        checkVanityUrlByAPI(
            homePath + '/' + pageVanityUrl2 + '/vanityUrlMapping/renamedVanity2fr',
            'renamedVanity2fr',
            'fr',
            'EDIT',
            'true',
        )
    })
})
