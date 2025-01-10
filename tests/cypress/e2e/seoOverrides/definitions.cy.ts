import { createSite, deleteSite, getNodeByPath } from '@jahia/cypress'
import { JContent } from '@jahia/jcontent-cypress/dist/page-object/jcontent'
import { Field } from '@jahia/jcontent-cypress/dist/page-object/fields/field'

describe('New SEO field definition tests', () => {
    const siteKey = 'seoFieldsTest'

    before(function () {
        createSite(siteKey)
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
        tagField.get().find('#htmlHead_seoKeywords').click()
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
})
