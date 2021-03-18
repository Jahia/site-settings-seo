class InvalidMappingError extends Error {
    constructor(mapping, ...params) {
        super(...params);

        this.name = 'InvalidMappingError';
        this.mapping = mapping;
    }
}

class DuplicateMappingError extends Error {
    constructor(mapping, ...params) {
        super(...params);

        this.name = 'DuplicateMappingError';
        this.mapping = mapping;
    }
}

class AddMappingsError extends Error {
    constructor(errors, ...params) {
        super(...params);

        this.name = 'AddMappingsError';
        this.errors = errors;
    }
}

class MoveSiteError extends Error {
    constructor(...params) {
        super(...params);
        this.name = 'MoveSiteError';
    }
}

export {InvalidMappingError, MoveSiteError, DuplicateMappingError, AddMappingsError};
