import {
    publishAndWaitJobEnding,
    createSite,
    deleteSite,
    addVanityUrl,
    setNodeProperty,
    unpublishNode,
} from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Checks the publication action in UIs', () => {
    const siteKey = 'testPublishActionsVanity'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'testPage'
    const langEN = 'en'
    const langFR = 'fr'
    const languages = langEN + ',' + langFR
    const pagePath = homePath + '/' + pageName
    const siteConfig = {
        languages: languages,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }
    const vanityUrls = [
        { lang: langEN, name: 'vanity-en', expectedPublished: 'false' },
        { lang: langEN, name: 'vanity-en-2', expectedPublished: 'false' },
        { lang: langFR, name: 'vanity-fr', expectedPublished: 'true' },
    ]

    let pageUuid = ''

    const createPage = (parent: string, name: string, template: string, lang: string) => {
        return cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: lang,
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
    }

    before('create test data', function () {
        createSite(siteKey, siteConfig)
        createPage(homePath, pageName, 'default', langEN).then(({ data }) => {
            setNodeProperty(pagePath, 'jcr:title', 'fr title', langFR)
            pageUuid = data.jcr.addNode.uuid
        })
        vanityUrls.forEach((vanity) => {
            addVanityUrl(pagePath, vanity.lang, vanity.name)
        })
        publishAndWaitJobEnding(pagePath, [langEN, langFR])
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Check if publish actions not present for vanity on not published content for language', function () {
        cy.login()
        unpublishNode(pagePath, langEN)
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pageUuid)
        pageCard.open()
        pageCard.getPublishAllButton().should('be.disabled')

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-en')
        const menu = vanityUrlRow.openContextualMenu()
        menu.getPublishButton().should('not.exist')
    })
})
