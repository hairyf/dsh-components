// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/schema-operations.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Hide the Cordis service identity behind bound schema callbacks.
* @param service - settings-owned schema service available in the apply context.
* @returns callbacks that cannot expose the service context to React components.
*/
function createSettingsSchemaOperations(service) {
	return {
		rehydrate: (serialized) => service.rehydrate(serialized),
		validate: (schema, draft) => service.validate(schema, draft),
		nodeAtPath: (root, path) => service.nodeAtPath(root, path),
		getPath: (value, path) => service.getPath(value, path),
		hasPath: (value, path) => service.hasPath(value, path),
		setPath: (root, path, value) => service.setPath(root, path, value),
		deletePath: (root, path) => service.deletePath(root, path)
	};
}
