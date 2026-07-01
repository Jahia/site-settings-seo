import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, setNodeProperty } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'
import { addSimplePage } from '../../utils/Utils'

describe('Checks the sort of pages in dashboard', () => {
    const siteKey = 'testSort'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const prefixPageName = 'testPage'
    const langEN = 'en'
    const langFR = 'fr'
    const siteConfig = {
        languages: langEN + ',' + langFR,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }
    const letterList = ['a', '2', 'b2', 'c', 'v', 'e', 'f', 'p', 'h', 'x', 'j', '1', 'C1', 'C3', 'c2']

    const pages: Record<string, string> = {}

    before('create test data', function () {
        createSite(siteKey, siteConfig)
        letterList.forEach((letter) => {
            const pageName = `${prefixPageName}-${letter}`
            const pagePath = homePath + '/' + pageName
            addSimplePage(homePath, pageName, pageName, langEN, 'default')
            addVanityUrl(pagePath, 'en', `vanity-${letter}`)
            publishAndWaitJobEnding(pagePath, [langEN])
        })

        // Page for: filter by language
        addSimplePage(homePath, 'pageFilter', 'pageFilter', langEN, 'default').then(({ data }) => {
            pages['pageFilter'] = data.jcr.addNode.uuid
        })
        setNodeProperty(homePath + '/pageFilter', 'jcr:title', 'pageFilter-fr', langFR)
        addVanityUrl(homePath + '/pageFilter', langEN, 'vanity-english')
        addVanityUrl(homePath + '/pageFilter', langFR, 'vanity-french')
        publishAndWaitJobEnding(homePath + '/pageFilter', [langEN, langFR])

        // Page for: staging/live and non-published in live
        addSimplePage(homePath, 'pageLive', 'pageLive', langEN, 'default').then(({ data }) => {
            pages['pageLive'] = data.jcr.addNode.uuid
        })
        addVanityUrl(homePath + '/pageLive', langEN, 'vanity-published')
        publishAndWaitJobEnding(homePath + '/pageLive', [langEN])
        addVanityUrl(homePath + '/pageLive', langEN, 'vanity-not-published')
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('check if pages are sorted by name.', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        const pagesWithVanityUrl = vanityUrlsPage.getPagesWithVanityUrl().items()

        pagesWithVanityUrl.should('have.length', 10)

        const allPageNames = [
            ...letterList.map((letter) => `${prefixPageName}-${letter}`),
            'pageFilter',
            'pageLive',
        ].sort(Intl.Collator().compare)

        pagesWithVanityUrl.each((page, index) => {
            cy.wrap(page).should('contain', allPageNames[index])
        })
    })

    it('should filter vanity urls by French language', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)

        const languageSelector = vanityUrlsPage.getLanguageSelector()
        languageSelector.filterByLanguages('en')

        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageFilter'])
        pageCard.open()
        pageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-french').get().should('exist')
    })

    it('should display the live vanity URLs section when switching to staging and live', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageLive'])
        pageCard.open()

        vanityUrlsPage.switchToStagingAndLiveMode()

        pageCard.getLiveVanityUrls().get().should('exist')
        pageCard.getLiveVanityUrls().getVanityUrlRow('/vanity-published').get().should('exist')
    })

    it('should not display the non-published vanity url in live mode', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, langEN)
        const pageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(pages['pageLive'])
        pageCard.open()

        vanityUrlsPage.switchToLiveMode()

        pageCard.getLiveVanityUrls().get().should('exist')
        pageCard.getLiveVanityUrls().get().find('td').contains('/vanity-not-published').should('not.exist')
    })
})
