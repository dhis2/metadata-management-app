const config = {
    setupFiles: ['whatwg-fetch'],
    setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    coverageThreshold: {
        global: {
            // TODO: The following should be 50
            branches: 0,

            // TODO: The following should be 75
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
}

module.exports = config
