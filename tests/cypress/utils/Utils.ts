import { addNode } from '@jahia/cypress'

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
