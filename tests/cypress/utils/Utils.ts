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
                if (!result?.data) {
                    return false
                }
                const nodeByPath = result.data.jcr.nodeByPath
                return (
                    nodeByPath.name === vanityUrlName &&
                    nodeByPath.properties.find((property) => property.name === 'j:default').value === isCanonical
                )
            })
        },
        {
            errorMsg: 'Vanity url not available in time',
            timeout: 10000,
            interval: 500,
        },
    )
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
