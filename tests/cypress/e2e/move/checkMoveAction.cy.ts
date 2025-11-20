import { publishAndWaitJobEnding, createSite, deleteSite, addVanityUrl, getComponent, deleteNode } from '@jahia/cypress'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'
import { MoveValidationDialog } from '../../page-object/components/dialog/MoveValidationDialog'

describe('Checks the publication action on not published pages in UIs', () => {
    const siteKey = 'testMoveVanity'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'

    const sourcePageName = 'sourcePage'
    const sourcePagePath = homePath + '/' + sourcePageName
    let sourcePageUuid = ''

    const targetPageName = 'targetPage'
    const targetPagePath = homePath + '/' + targetPageName
    let targetPageUuid = ''

    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
        serverName: 'localhost',
        locale: langEN,
    }

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
    before('Create site', function () {
        createSite(siteKey, siteConfig)
    })

    beforeEach('Create test data', function () {
        createPage(homePath, sourcePageName, 'default', langEN).then(({ data }) => {
            sourcePageUuid = data.jcr.addNode.uuid
        })
        createPage(homePath, targetPageName, 'default', langEN).then(({ data }) => {
            targetPageUuid = data.jcr.addNode.uuid
        })

        addVanityUrl(sourcePagePath, langEN, 'vanity-to-move-a')
        addVanityUrl(sourcePagePath, langEN, 'vanity-to-move-b')

        publishAndWaitJobEnding(sourcePagePath, [langEN])
        publishAndWaitJobEnding(targetPagePath, [langEN])
    })

    afterEach('Clear test data', function () {
        deleteNode(homePath + '/' + sourcePageName)
        deleteNode(homePath + '/' + targetPageName)

        publishAndWaitJobEnding(homePath, ['en'])
    })
    after('Delete site', function () {
        deleteSite(siteKey)
    })

    it.skip('Should move the vanity url from source page to target page', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')

        const sourcePageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(sourcePageUuid)
        sourcePageCard.open()

        const vanityUrlRow = sourcePageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-a')
        const menu = vanityUrlRow.openContextualMenu()
        const picker = menu.clickOnMove()

        cy.get('li[data-sel-role="home"]').click()
        picker.getTable().getRowByLabel(targetPageName).click()
        picker.select()

        const moveValidationDialog = getComponent(MoveValidationDialog)
        moveValidationDialog.move()

        const targetPageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(targetPageUuid)
        targetPageCard.open()
        targetPageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-a').should('exist')

        sourcePageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-b')
    })

    it.skip('Should move several vanity urls from source page to target page', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')

        const sourcePageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(sourcePageUuid)
        sourcePageCard.open()

        const vanityUrlRowA = sourcePageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-a')
        vanityUrlRowA.select()
        const vanityUrlRowB = sourcePageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-b')
        vanityUrlRowB.select()

        const toolbar = vanityUrlsPage.getToolbar()
        const picker = toolbar.clickOnMove()

        cy.get('li[data-sel-role="home"]').click()
        picker.getTable().getRowByLabel(targetPageName).click()
        picker.select()

        const moveValidationDialog = getComponent(MoveValidationDialog)
        moveValidationDialog.move()

        const targetPageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(targetPageUuid)
        targetPageCard.open()
        targetPageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-a').should('exist')
        targetPageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-b').should('exist')
    })

    it('Should display info box and correct message for moved vanity url in live column of source page', function () {
        cy.login()
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.switchToStagingAndLiveMode()
        vanityUrlsPage.verifyCurrentMode('Staging and live')

        const sourcePageCard = vanityUrlsPage.getPagesWithVanityUrl().getPageCard(sourcePageUuid)
        sourcePageCard.open()
        const vanityUrlRow = sourcePageCard.getStagingVanityUrls().getVanityUrlRow('/vanity-to-move-a')
        const menu = vanityUrlRow.openContextualMenu()
        const picker = menu.clickOnMove()
        cy.get('li[data-sel-role="home"]').click()
        picker.getTable().getRowByLabel(targetPageName).click()
        picker.select()

        const moveValidationDialog = getComponent(MoveValidationDialog)
        moveValidationDialog.move()

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000)
        sourcePageCard.open()
        const liveVanityUrlRowA = sourcePageCard.getLiveVanityUrls().getVanityUrlRow('/vanity-to-move-a')
        const liveVanityUrlRowB = sourcePageCard.getLiveVanityUrls().getVanityUrlRow('/vanity-to-move-b')
        liveVanityUrlRowA.containsInfo().should('be.true')
        liveVanityUrlRowA.getLanguage().should('eq', 'en')
        liveVanityUrlRowA.isCanonical().should('be.false')
        liveVanityUrlRowB.containsInfo().should('be.false')

        cy.log('Check info dialog message')
        const infoDialog = liveVanityUrlRowA.displayInfo()
        infoDialog.getMessage().should('eq', `This vanity URL will be removed when ${targetPagePath} is published`)
        infoDialog.close()
    })
})
