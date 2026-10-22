import { addVanityUrl, createSite, deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'

describe('Head links of a page whose vanity URL holds special characters', () => {
    const siteKey = 'headLinksVanityChars'
    const homePath = '/sites/' + siteKey + '/home'
    const plainPage = 'plain-vanity'
    const quotedPage = 'quoted-vanity'
    const plainUrl = "/head-links-l'été&copy"
    const quotedUrl = '/head-links-"q"&co'

    const createPage = (name: string) => {
        cy.apollo({
            variables: { parentPathOrId: homePath, name: name, template: 'withoutseo', language: 'en' },
            mutationFile: 'graphql/jcrAddPage.graphql',
        })
        setNodeProperty(homePath + '/' + name, 'jcr:title', name + '-fr', 'fr')
    }

    const getHead = (pageName: string) =>
        cy.request({ url: homePath + '/' + pageName + '.html', followRedirect: false }).then((response) => {
            expect(response.status).to.eq(200)
            return new DOMParser().parseFromString(response.body, 'text/html')
        })

    const hrefOf = (doc: Document, selector: string) => doc.querySelector(selector)?.getAttribute('href')

    before('create test data', function () {
        deleteSite(siteKey)
        createSite(siteKey, {
            languages: 'en,fr',
            templateSet: 'site-settings-seo-test-module',
            serverName: 'head-links.example',
            locale: 'en',
        })
        setNodeProperty(homePath, 'jcr:title', 'home-fr', 'fr')
        createPage(plainPage)
        createPage(quotedPage)
        addVanityUrl(homePath + '/' + plainPage, 'en', plainUrl)
        addVanityUrl(homePath + '/' + quotedPage, 'en', '/head-links-quoted').then((result) => {
            setNodeProperty(result.data.jcr.mutateNode.addVanityUrl[0].uuid, 'j:url', quotedUrl, 'en')
        })
        publishAndWaitJobEnding(homePath, ['en', 'fr'])
    })

    after('clear test data', function () {
        deleteSite(siteKey)
    })

    it('Keeps the vanity URL of the page as typed in the head links', function () {
        getHead(plainPage).then((doc) => {
            expect(hrefOf(doc, 'link[rel="canonical"]')).to.match(/^https?:\/\/[^/]+\/head-links-l'été&copy$/)
            expect(hrefOf(doc, 'link[rel="alternate"][hreflang="en"]')).to.match(/\/head-links-l'été&copy$/)
            expect(hrefOf(doc, 'link[rel="alternate"][hreflang="x-default"]')).to.match(/\/head-links-l'été&copy$/)
        })
    })

    it('Keeps a vanity URL with quotes as typed in the head links', function () {
        getHead(quotedPage).then((doc) => {
            expect(hrefOf(doc, 'link[rel="canonical"]')).to.match(/\/head-links-"q"&co$/)
            expect(hrefOf(doc, 'link[rel="alternate"][hreflang="en"]')).to.match(/\/head-links-"q"&co$/)
            expect(hrefOf(doc, 'link[rel="alternate"][hreflang="x-default"]')).to.match(/\/head-links-"q"&co$/)
            expect(hrefOf(doc, 'link[rel="alternate"][hreflang="fr"]')).to.match(/\/fr\/sites\/headLinksVanityChars\//)
        })
    })
})
