import { addNode, createSite, deleteSite, getNodeByPath } from '@jahia/cypress'
import { JContent } from '@jahia/jcontent-cypress/dist/page-object/jcontent'
import { Field } from '@jahia/jcontent-cypress/dist/page-object/fields/field'

describe('SEO keywords tests', () => {
    const siteKey = 'seoKeywordsTest'
    const pageName_addTest = 'pagetest_addTag'
    const pageName_removeTest = 'pagetest_removeTag'
    const searchTag = { en: 'test1en', fr: 'test1fr' }

    const createPageWithSEOKeyword = (pageName: string) => {
        return addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            mixins: ['jmix:seoHtmlHead'],
            properties: [
                { name: 'j:templateName', value: 'simple' },
                { name: 'jcr:title', language: 'en', value: pageName },
                { name: 'jcr:title', language: 'fr', value: pageName },
                { name: 'seoKeywords', language: 'en', values: [searchTag.en, 'test2en'] },
                { name: 'seoKeywords', language: 'fr', values: [searchTag.fr, 'test2fr'] },
            ],
        })
    }

    before(function () {
        createSite(siteKey, { templateSet: 'dx-base-demo-templates', serverName: 'localhost', locale: 'en,fr' })
        createPageWithSEOKeyword(pageName_addTest)
        createPageWithSEOKeyword(pageName_removeTest)
    })

    after(function () {
        deleteSite(siteKey)
        cy.logout()
    })

    beforeEach(function () {
        cy.loginAndStoreSession()
    })

    it('should be able to search for seo keywords tag', { retries: 3 }, function () {
        const searchTagInLang = (lang) => {
            cy.log(`Search for ${searchTag[lang]} in ${lang} site`)
            cy.visit(`cms/render/default/${lang}/sites/${siteKey}/home/search-results.html`)
            cy.get('.search-block input[type="text"]').type(`${searchTag[lang]}{enter}`)
            cy.get('.s-results').contains(searchTag[lang], { timeout: 10000 }).should('be.visible')
        }
        searchTagInLang('en')
        searchTagInLang('fr')
    })

    it('should be possible to edit SEO fields : adding a new value', function () {
        const ce = JContent.visit(siteKey, 'en', `pages/home/${pageName_addTest}`).editPage()

        ce.openSection('seo')

        const tagField = ce.getField(Field, 'htmlHead_seoKeywords')
        tagField.get().find('#htmlHead_seoKeywords').type('newtag{enter}', { delay: 500 })
        tagField
            .should('exist')
            .and('be.visible')
            .and('contain', 'test1en')
            .and('contain', 'test2en')
            .and('contain', 'newtag')
        ce.save()

        getNodeByPath(`/sites/${siteKey}/home/${pageName_addTest}`, ['seoKeywords']).then(({ data }) => {
            expect(data.jcr.nodeByPath.properties.length).to.eq(1)
            expect(data.jcr.nodeByPath.properties[0].values.length).to.eq(3)
            expect(data.jcr.nodeByPath.properties[0].values).to.contains('newtag')
        })
    })

    it('should be possible to edit SEO fields : removing a value', function () {
        const ce = JContent.visit(siteKey, 'en', `pages/home/${pageName_removeTest}`).editPage()

        ce.openSection('seo')

        const tagField = ce.getField(Field, 'htmlHead_seoKeywords')
        tagField.get().find('#htmlHead_seoKeywords').find('span:contains("test1en")').siblings('svg').click()
        tagField.should('exist').and('be.visible').and('contain', 'test2en')
        ce.save()

        getNodeByPath(`/sites/${siteKey}/home/${pageName_removeTest}`, ['seoKeywords']).then(({ data }) => {
            expect(data.jcr.nodeByPath.properties.length).to.eq(1)
            expect(data.jcr.nodeByPath.properties[0].values.length).to.eq(1)
            expect(data.jcr.nodeByPath.properties[0].values[0]).to.eq('test2en')
        })
    })
})
