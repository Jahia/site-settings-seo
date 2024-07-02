import { editSite, publishAndWaitJobEnding, deleteNode, addNode, setNodeProperty } from '@jahia/cypress'
import { addVanityUrl } from '@jahia/cypress'
import { addSimplePage } from '../utils/Utils'

describe('SEO url rewrite on internal links', () => {
    const siteKey = 'digitall'
    const sitePath = '/sites/' + siteKey
    const homePath = sitePath + '/home'
    const pageName1 = 'page1'
    const pageName2 = 'page2'
    const pagePath1 = homePath + '/' + pageName1
    const pagePath2 = homePath + '/' + pageName2

    before('create test data', function () {
        editSite('digitall', { serverName: 'jahia' })
        cy.login()
        addSimplePage(homePath, pageName1, pageName1, 'en')
        setNodeProperty(pagePath1, 'jcr:title', 'page1-fr', 'fr')
        addSimplePage(homePath, pageName2, pageName2, 'en')
        setNodeProperty(pagePath2, 'jcr:title', 'page2-fr', 'fr')

        const variablesLinkList = {
            parentPathOrId: pagePath1 + '/area-main',
            primaryNodeType: 'jnt:linkList',
            name: 'linkList',
            properties: [
                { name: 'j:nodename', value: 'linkList', language: 'en' },
                { name: 'j:nodename', value: 'linkList', language: 'fr' },
            ],
        }
        addNode(variablesLinkList)
        const variablesLink = {
            parentPathOrId: pagePath1 + '/area-main/linkList',
            primaryNodeType: 'jnt:nodeLink',
            name: 'LinkPage2',
            properties: [
                { name: 'j:nodename', value: 'link to page 2', language: 'en' },
                { name: 'j:target', value: '_self', language: 'en' },
                { name: 'j:node', type: 'WEAKREFERENCE', value: pagePath2, language: 'en' },
                { name: 'j:nodename', value: 'link to page 2', language: 'fr' },
                { name: 'j:target', value: '_self', language: 'fr' },
                { name: 'j:node', type: 'WEAKREFERENCE', value: pagePath2, language: 'fr' },
            ],
        }
        addNode(variablesLink)

        publishAndWaitJobEnding(pagePath1, ['en', 'fr'])
        publishAndWaitJobEnding(pagePath2, ['en', 'fr'])
    })

    after('clear test data', function () {
        deleteNode(pagePath1)
        deleteNode(pagePath2)
        publishAndWaitJobEnding(homePath, ['en', 'fr'])
        editSite('digitall', { serverName: 'localhost' })
    })

    it('Internal link without vanity url', function () {
        const pageLink2en = '/home/' + pageName2 + '.html'
        const pageLink2fr = '/fr/home/' + pageName2 + '.html'

        cy.visit(pagePath1 + '.html')

        cy.get('div[class="container-fluid"]')
            .find('a[href="' + pageLink2en + '"]')
            .should('be.visible')

        cy.visit('/fr' + pagePath1 + '.html')

        cy.get('div[class="container-fluid"]')
            .find('a[href="' + pageLink2fr + '"]')
            .should('be.visible')
    })

    it('Internal link with simple vanity url', function () {
        const pageLink2en = '/vanitytesten'
        const pageLink2fr = '/vanitytestfr'

        addVanityUrl(pagePath2, 'en', pageLink2en)
        addVanityUrl(pagePath2, 'fr', pageLink2fr)
        publishAndWaitJobEnding(pagePath2)

        cy.visit(pagePath1 + '.html')

        cy.get('div[class="container-fluid"]')
            .find('a[href="' + pageLink2en + '"]')
            .should('be.visible')

        cy.visit('/fr' + pagePath1 + '.html')

        cy.get('div[class="container-fluid"]')
            .find('a[href="' + pageLink2fr + '"]')
            .should('be.visible')
    })

    it('Internal link with vanity url containing special characters', function () {
        const pageLink2en = '/й€£µ!§ '
        const pageLink2fr = '/онлайн'

        addVanityUrl(pagePath2, 'en', pageLink2en)
        addVanityUrl(pagePath2, 'fr', pageLink2fr)
        publishAndWaitJobEnding(pagePath2)

        cy.visit(pagePath1 + '.html')

        cy.get('div[class="container-fluid"]')
            .find('a[href="' + pageLink2en + '"]')
            .should('be.visible')

        cy.visit('/fr' + pagePath1 + '.html')

        cy.get('div[class="container-fluid"]')
            .find('a[href="' + pageLink2fr + '"]')
            .should('be.visible')
    })
})
