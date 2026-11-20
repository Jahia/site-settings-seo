import {registry} from '@jahia/ui-extender';

/**
 * Asks the modules that know the node a vanity URL is already used by to explain it to the editor.
 *
 * A module registers an entry of type `vanityUrlConflict`:
 *
 *     registry.add('vanityUrlConflict', '<key>', {
 *         explain: ({existingNodePath, urlMapping, client, t}) => Promise<{label?, message} | null>
 *     });
 *
 * `explain` answers null when the node is not one it knows. The first entry to answer wins; an entry
 * that throws is skipped, and with no answer the caller keeps its own message.
 *
 * @returns {Promise<{label?: string, message: string} | null>}
 */
export const explainConflict = async ({existingNodePath, urlMapping, client, t}) => {
    for (const entry of registry.find({type: 'vanityUrlConflict'})) {
        try {
            // Sequential on purpose: the first module to recognise the node answers
            // eslint-disable-next-line no-await-in-loop
            const explanation = await entry.explain({existingNodePath, urlMapping, client, t});
            if (explanation?.message) {
                return explanation;
            }
        } catch (error) {
            console.warn(`[site-settings-seo] vanityUrlConflict "${entry.key}" could not explain ${existingNodePath}:`, error);
        }
    }

    return null;
};
