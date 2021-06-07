// Dummy test file
describe('Successfully navigates to sandbox app', () => {
    it('successfully navigate to the app', () => {
        cy.visit('/', {
            failOnStatusCode: false
        })
    })
})
