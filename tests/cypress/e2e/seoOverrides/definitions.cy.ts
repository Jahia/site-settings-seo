import { addNode, createSite, deleteSite, getNodeByPath } from '@jahia/cypress'
import { JContent } from '@jahia/jcontent-cypress/dist/page-object/jcontent'
import { Field } from '@jahia/jcontent-cypress/dist/page-object/fields/field'

describe('New SEO field definition tests', () => {
    const siteKey = 'seoFieldsTest'
    const pageName_addTest = 'pagetest_addTag'
    const pageName_removeTest = 'pagetest_removeTag'

    const createPageWithSEOKeyword = (pageName: string) => {
        return addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: pageName,
            primaryNodeType: 'jnt:page',
            mixins: ['jmix:seoHtmlHead'],
            properties: [
                {
                    name: 'j:templateName',
                    value: 'simple',
                },
                {
                    name: 'jcr:title',
                    value: pageName,
                    language: 'en',
                },
                {
                    name: 'seoKeywords',
                    values: ['test2en', 'test1en'],
                    language: 'en',
                },
            ],
            children: [],
        })
    }

    before(function () {
        createSite(siteKey)
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

    it('should have new SEO fields for pages and can be saved', function () {
        const ce = JContent.visit(siteKey, 'en', 'pages/home').editPage()

        ce.openSection('seo')
        ce.getField(Field, 'htmlHead_jcr:description').should('exist').and('be.visible')
        ce.getField(Field, 'htmlHead_seoKeywords').should('exist').and('be.visible')
        ce.getField(Field, 'htmlHead_openGraphImage').should('exist').and('be.visible')

        ce.getField(Field, 'htmlHead_jcr:description').get().find('textarea').type('description test')
        const tagField = ce.getField(Field, 'htmlHead_seoKeywords')
        tagField.get().find('#htmlHead_seoKeywords').type('tag{enter}', { delay: 500 })
        tagField.get().find('#htmlHead_seoKeywords [role="button"]').contains('tag').should('be.visible')

        const picker = ce.getPickerField('htmlHead_openGraphImage').open()
        picker.getViewMode().select('List')
        picker.search('svg')
        picker.verifyResultsLength(1)
        picker.getTableRow('glyphicons-halflings-regular.svg').click()
        picker.select()

        ce.save()

        getNodeByPath(`/sites/${siteKey}/home`, ['seoKeywords']).then(({ data }) => {
            expect(data.jcr.nodeByPath.properties.length).to.eq(1)
            expect(data.jcr.nodeByPath.properties[0].values.length).to.eq(1)
            expect(data.jcr.nodeByPath.properties[0].values[0]).to.eq('tag')
        })
    })

    it('should not have SEO section and new SEO fields for other types', function () {
        JContent.visit(siteKey, 'en', 'content-folders/contents').createContent('Rich text')
        cy.get(`[data-sel-content-editor-fields-group="seo"]`).should('not.exist', { timeout: 10000 })

        const assertFieldNotExist = (contentType) => {
            cy.get(`[data-sel-content-editor-field="${contentType}"]`).should('not.exist', { timeout: 10000 })
        }
        assertFieldNotExist('htmlHead_jcr:description')
        assertFieldNotExist('htmlHead_seoKeywords')
        assertFieldNotExist('htmlHead_openGraphImage')
    })

    it('should be possible to edit SEO fields : adding a new value', function () {
        const ce = JContent.visit(siteKey, 'en', 'pages/home/' + pageName_addTest).editPage()

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
        const ce = JContent.visit(siteKey, 'en', 'pages/home/' + pageName_removeTest).editPage()

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
