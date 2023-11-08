import {
    publishAndWaitJobEnding,
    createSite,
    deleteSite,
    createUser,
    deleteUser,
    grantRoles,
    addNode,
    deleteNode,
} from '@jahia/cypress'
import { ContentEditorSEO } from '../../page-object/ContentEditorSEO'
import { checkVanityUrlByAPI } from '../../utils/Utils'
import { PageComposer } from '@jahia/content-editor-cypress/dist/page-object/pageComposer'

describe('Test UIs permissions', () => {
    const siteKey = 'siteForPermissionsCheck'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageNameA = 'basic-pageA'
    const pageNameB = 'basic-pageB'
    const pagePathA = homePath + '/' + pageNameA
    const pagePathB = homePath + '/' + pageNameB
    const langEN = 'en'
    const siteConfig = {
        languages: langEN,
        templateSet: 'dx-base-demo-templates',
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
        // Create a new website with 2 pages
        createSite(siteKey, siteConfig)
        createPage(homePath, pageNameA, 'simple', langEN)
        createPage(homePath, pageNameB, 'simple', langEN)
        publishAndWaitJobEnding(homePath)

        // Create 2 new role `: one with vanity url modal access, one without vanity url modal access
        addNode({
            parentPathOrId: '/roles',
            name: 'vanityRole',
            primaryNodeType: 'jnt:role',
            properties: [
                {
                    name: 'j:permissionNames',
                    values: ['jcr:all_default', 'viewVanityUrlModal'],
                },
                { name: 'j:hidden', value: 'false' },
                { name: 'j:roleGroup', value: 'edit-role' },
                { name: 'j:privilegedAccess', value: 'true' },
            ],
            children: [
                {
                    name: 'currentSite-access',
                    primaryNodeType: 'jnt:externalPermissions',
                    properties: [
                        {
                            name: 'j:permissionNames',
                            values: [
                                'viewContentTab',
                                'jContentAccess',
                                'jContentAccordions',
                                'jContentActions',
                                'pageComposerAccess',
                                'components',
                                'templates',
                            ],
                        },
                        { name: 'j:path', value: 'currentSite' },
                    ],
                },
            ],
        })

        addNode({
            parentPathOrId: '/roles',
            name: 'noVanityRole',
            primaryNodeType: 'jnt:role',
            properties: [
                {
                    name: 'j:permissionNames',
                    values: ['jcr:all_default'],
                },
                { name: 'j:hidden', value: 'false' },
                { name: 'j:roleGroup', value: 'edit-role' },
                { name: 'j:privilegedAccess', value: 'true' },
            ],
            children: [
                {
                    name: 'currentSite-access',
                    primaryNodeType: 'jnt:externalPermissions',
                    properties: [
                        {
                            name: 'j:permissionNames',
                            values: [
                                'viewContentTab',
                                'jContentAccess',
                                'jContentAccordions',
                                'jContentActions',
                                'pageComposerAccess',
                                'components',
                                'templates',
                            ],
                        },
                        { name: 'j:path', value: 'currentSite' },
                    ],
                },
            ],
        })

        // Create a user and grant him the vanityUrl role on pageA and noVanityUrl role on pageB
        createUser('user1', 'password')
        grantRoles(pagePathA, ['vanityRole'], 'user1', 'USER')
        grantRoles(pagePathB, ['noVanityRole'], 'user1', 'USER')
    })

    after('Clear test data', function () {
        deleteSite(siteKey)
        deleteUser('user1')
        deleteNode('/roles/vanityRole')
        deleteNode('/roles/noVanityRole')
    })

    it('Verify that user having permission can see the vanity url modal button', function () {
        cy.login('user1', 'password')
        const composer = new PageComposer()
        PageComposer.visit(siteKey, 'en', 'home.html')
        composer.editPage(pageNameA)
        const contenteditor = new ContentEditorSEO()
        contenteditor.checkVanityUrlVisibility(true)

        cy.logout()
    })

    it('Verify that user having permission can see and edit some data in the vanity url modal', function () {
        cy.login('user1', 'password')
        const composer = new PageComposer()
        PageComposer.visit(siteKey, 'en', 'home.html')
        composer.editPage(pageNameA)
        const contenteditor = new ContentEditorSEO()
        const vanityUrlUi = contenteditor.openVanityUrlUi()
        vanityUrlUi.addVanityUrl('vanityurl-test-modalAccess')
        // Check vanity url was created as expected
        checkVanityUrlByAPI(
            pagePathA + '/vanityUrlMapping/vanityurl-test-modalAccess',
            'vanityurl-test-modalAccess',
            'fr',
            'EDIT',
            'false',
        )
        vanityUrlUi.getVanityUrlRow('/vanityurl-test-modalAccess')

        cy.logout()
    })

    it('Verify that user without permission cannot see the vanity url modal', function () {
        cy.login('user1', 'password')
        const composer = new PageComposer()
        PageComposer.visit(siteKey, 'en', 'home.html')
        composer.editPage(pageNameB)
        const contenteditor = new ContentEditorSEO()
        contenteditor.checkVanityUrlVisibility(false)

        cy.logout()
    })
})
