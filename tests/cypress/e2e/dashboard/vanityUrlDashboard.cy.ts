import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, setNodeProperty } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'

describe('Vanity URL dashboard tests', () => {
    const siteKey = 'testDashboardVanity'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const langEN = 'en'
    const langFR = 'fr'
    const languages = langEN + ',' + langFR
    const siteConfig = {
        languages: languages,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }

    const pages: Record<string, string> = {}

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

    before('Create site and test data', function () {
        createSite(siteKey, siteConfig)

        // Page for: display, activate/deactivate
        createPage(homePath, 'pageReadOnly', 'default', langEN).then(({ data }) => {
            pages['pageReadOnly'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageReadOnly', langEN, 'vanity-dashboard')
        addVanityUrl(homePath + '/pageReadOnly', langEN, 'vanity-active-toggle')
        publishAndWaitJobEnding(homePath + '/pageReadOnly', [langEN])

        // Page for: add vanity
        createPage(homePath, 'pageAdd', 'default', langEN).then(({ data }) => {
            pages['pageAdd'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageAdd', langEN, 'existing-vanity')
        publishAndWaitJobEnding(homePath + '/pageAdd', [langEN])

        // Page for: set canonical
        createPage(homePath, 'pageSetCanonical', 'default', langEN).then(({ data }) => {
            pages['pageSetCanonical'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageSetCanonical', langEN, 'vanity-not-canonical')
        addVanityUrl(homePath + '/pageSetCanonical', langEN, 'vanity-canonical')
        publishAndWaitJobEnding(homePath + '/pageSetCanonical', [langEN])

        // Page for: unset canonical
        createPage(homePath, 'pageUnsetCanonical', 'default', langEN).then(({ data }) => {
            pages['pageUnsetCanonical'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageUnsetCanonical', langEN, 'vanity-is-canonical')
        publishAndWaitJobEnding(homePath + '/pageUnsetCanonical', [langEN])

        // Page for: change language and canonical + language change
        createPage(homePath, 'pageLang', 'default', langEN).then(({ data }) => {
            pages['pageLang'] = data.jcr.addNode.uuid
        })
        setNodeProperty(homePath + '/pageLang', 'jcr:title', 'pageLang-fr', langFR)
        addVanityUrl(homePath + '/pageLang', langEN, 'vanity-lang-change')
        addVanityUrl(homePath + '/pageLang', langEN, 'vanity-canonical-lang')
        publishAndWaitJobEnding(homePath + '/pageLang', [langEN, langFR])
    })

    after('Delete site', function () {
        deleteSite(siteKey)
    })

    it('should add a new vanity url from the dashboard', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageAdd'])
        pageCard.open()

        const addForm = pageCard.clickOnAddVanityUrl()
        addForm.fillVanityValues('new-vanity-added')

        pageCard.getStagingVanityUrls().getVanityUrlRow('/new-vanity-added').get().should('exist')
    })

    it('should set a vanity url as canonical via contextual menu', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageSetCanonical'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-not-canonical')
        vanityUrlRow.getCanonicalBadge().should('not.exist')

        const menu = vanityUrlRow.openContextualMenu()
        menu.get().find('[data-sel-role="updateVanity"]').click()

        pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-not-canonical').getCanonicalBadge().should('exist')
    })

    it('should unset a vanity url as canonical via contextual menu', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageUnsetCanonical'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-is-canonical')
        vanityUrlRow.getCanonicalBadge().should('exist')

        const menu = vanityUrlRow.openContextualMenu()
        menu.get().find('[data-sel-role="updateVanity"]').click()

        pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-is-canonical').getCanonicalBadge().should('not.exist')
    })

    it('should deactivate and reactivate a vanity url', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageReadOnly'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-active-toggle')

        vanityUrlRow.getActiveSwitch().should('be.checked')

        vanityUrlRow.toggleActive()
        vanityUrlRow.getActiveSwitch().should('not.be.checked')

        vanityUrlRow.toggleActive()
        vanityUrlRow.getActiveSwitch().should('be.checked')
    })

    it('should change the language of a vanity url', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageLang'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-lang-change')
        vanityUrlRow.changeLanguage(langFR)

        const vanityUrlsPageFr = VanityUrlsPage.visit(siteKey, langFR)
        const pageCardFr = vanityUrlsPageFr.getPagesWithVanityUrl().getPageCard(pages['pageLang'])
        pageCardFr.open()
        pageCardFr.getStagingVanityUrls().getVanityUrlRow('/vanity-lang-change').get().should('exist')
    })

    it('should remove canonical when changing the language of a canonical vanity url', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageLang'])
        pageCard.open()

        const vanityUrlRow = pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-canonical-lang')
        vanityUrlRow.getCanonicalBadge().should('exist')

        vanityUrlRow.changeLanguage(langFR)

        const vanityUrlsPageFr = VanityUrlsPage.visit(siteKey, langFR)
        const pageCardFr = vanityUrlsPageFr.getPagesWithVanityUrl().getPageCard(pages['pageLang'])
        pageCardFr.open()
        pageCardFr
            .getStagingVanityUrls()
            .getVanityUrlRow('/vanity-canonical-lang')
            .getCanonicalBadge()
            .should('not.exist')
    })
})
