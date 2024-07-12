class InvalidMappingError extends Error {
    constructor(mapping, ...params) {
        super(...params);

        this.name = 'InvalidMappingError';
        this.mapping = mapping;
    }
}

class InvalidCharError extends Error {
    constructor(mapping, ...params) {
        super(...params);

        this.name = 'InvalidCharError';
        this.mapping = mapping;
    }
}

class SitesMappingError extends Error {
    constructor(mapping, ...params) {
        super(...params);

        this.name = 'SitesMappingError';
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

export {
    InvalidMappingError,
    SitesMappingError,
    DuplicateMappingError,
    AddMappingsError,
    InvalidCharError
};
