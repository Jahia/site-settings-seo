import {
    publishAndWaitJobEnding,
    createSite,
    deleteSite,
    addVanityUrl,
    createUser,
    deleteUser,
    grantRoles,
    revokeRoles,
    addNode,
    deleteNode,
} from '@jahia/cypress'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'
import { VanityUrlsPage } from '../../page-object/vanityUrls.page'
import { PageComposer } from '@jahia/content-editor-cypress/dist/page-object/pageComposer'

describe('Test UIs permissions', () => {
    const siteKey = 'siteForPermissionsCheck'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName = 'basic-page'
    const pagePath = homePath + '/' + pageName
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'site-settings-seo-test-module',
        serverName: 'localhost',
        locale: langEN,
    }

    const createPage = (parent: string, name: string, template: string, lang: string) => {
        cy.apollo({
            variables: {
                parentPathOrId: parent,
                name: name,
                template: template,
                language: lang,
            },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
    }

    before('Create test data', function () {
        createSite(siteKey, siteConfig)
        createPage(homePath, `${pageName}-a`, 'withoutseo', langEN)
        createPage(homePath, `${pageName}-b`, 'withoutseo', langEN)
        addVanityUrl(`${pagePath}-a`, 'en', '/vanityOnPageA')
        addVanityUrl(`${pagePath}-b`, 'en', '/vanityOnPageB')
        publishAndWaitJobEnding(homePath)

        cy.log('Add user to check permissions')
        createUser('editorUser', 'password')
        grantRoles(sitePath, ['editor'], 'editorUser', 'USER')
        revokeRoles(`${pagePath}-a`, ['editor'], 'editorUser', 'USER')

        addNode({
            parentPathOrId: '/roles',
            name: 'vanityRoleOnly',
            primaryNodeType: 'jnt:role',
            properties: [
                { name: 'j:permissionNames', values: ['siteAdminUrlmapping'] },
                { name: 'j:roleGroup', value: 'edit-role' },
                { name: 'j:privilegedAccess', value: 'true' },
            ],
        })
        // Create user with siteAdminUrlmapping in another role
        cy.log('Add second user to check read only on the vanity urls in content editor')
        createUser('secondEditorUser', 'password')
        grantRoles(sitePath, ['editor'], 'secondEditorUser', 'USER')
        grantRoles(sitePath, ['vanityRoleOnly'], 'secondEditorUser', 'USER')
        revokeRoles(`${pagePath}-a`, ['editor'], 'secondEditorUser', 'USER')
    })

    after('Clear test data', function () {
        deleteSite(siteKey)
        deleteUser('editorUser')
        deleteUser('secondEditorUser')
        deleteNode('/roles/vanityRoleOnly')
    })

    it('Verify that user have permission to see vanity url on content editor', function () {
        cy.login('editorUser', 'password')
        const composer = new PageComposer()
        PageComposer.visit(siteKey, 'en', 'home.html')
        composer.editPage(`${pageName}-b`)
        const contenteditor = new ContentEditorSEO()
        const vanityUrlUi = contenteditor.openVanityUrlUi()
        vanityUrlUi.getVanityUrlRow('/vanityOnPageB').should('exist')
        cy.logout()
    })

    it('Verify that user have access to vanity url page and only page-a is read only', function () {
        cy.login('editorUser', 'password')
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.findReadOnlyBadge(`${pageName}-a`).should('exist')
        cy.logout()
    })

    it('Verify that user have access to vanity url page and can edit page-b', function () {
        cy.login('editorUser', 'password')
        const vanityUrlsPage = VanityUrlsPage.visit(siteKey, 'en')
        vanityUrlsPage.findReadOnlyBadge(`${pageName}-b`).should('not.exist')
        cy.logout()
    })

    it('Verify that user have access to vanity url in content editor in read only', function () {
        cy.login('secondEditorUser', 'password')
        const composer = new PageComposer()
        PageComposer.visit(siteKey, 'en', 'home.html')
        composer.editPage(`${pageName}-a`)
        const contenteditor = new ContentEditorSEO()
        const vanityUrlUi = contenteditor.openVanityUrlUi()
        vanityUrlUi.findReadOnlyBadge().should('exist')
        vanityUrlUi.getVanityUrlRow('/vanityOnPageA').should('exist')
        cy.logout()
    })
})
