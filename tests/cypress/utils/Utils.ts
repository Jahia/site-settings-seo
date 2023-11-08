import { addNode, getNodeByPath } from '@jahia/cypress'

export const addSimplePage = (
    parentPathOrId: string,
    pageName: string,
    pageTitle: string,
    language: string,
    template = 'home',
) => {
    const variables = {
        parentPathOrId: parentPathOrId,
        name: pageName,
        title: pageTitle,
        primaryNodeType: 'jnt:page',
        template: 'home',
        properties: [
            { name: 'jcr:title', value: pageTitle, language: language },
            { name: 'j:templateName', type: 'STRING', value: template },
        ],
        children: [
            {
                name: 'area-main',
                primaryNodeType: 'jnt:contentList',
                children: [
                    {
                        name: 'text',
                        primaryNodeType: 'jnt:text',
                        properties: [{ language: language, name: 'text', type: 'STRING', value: pageName }],
                    },
                ],
            },
        ],
    }
    return addNode(variables)
}

export const checkVanityUrlDoNotExistByAPI = (
    vanityUrlPath: string,
    language: string,
    workspace: 'EDIT' | 'LIVE' = 'EDIT',
) => {
    // eslint-disable-next-line
    cy.wait(500)

    getNodeByPath(vanityUrlPath, [], language, [], workspace).then((result) => {
        expect(result?.data).eq(undefined)
    })
}

export const checkVanityUrlByAPI = (
    vanityUrlPath: string,
    vanityUrlName: string,
    language: string,
    workspace: 'EDIT' | 'LIVE' = 'EDIT',
    isCanonical: string,
) => {
    cy.waitUntil(
        () => {
            return getNodeByPath(vanityUrlPath, ['j:default'], language, [], workspace).then((result) => {
                expect(result?.data).not.eq(undefined)
                expect(result?.data?.jcr.nodeByPath.name).eq(vanityUrlName)
                expect(result?.data?.jcr.nodeByPath.properties[0].name).eq('j:default')
                expect(result?.data?.jcr.nodeByPath.properties[0].value).eq(isCanonical)
            })
        },
        {
            errorMsg: 'Vanity url not available in time',
            timeout: 10000,
            interval: 500,
        },
    )
}
