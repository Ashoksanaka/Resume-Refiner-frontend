import '@testing-library/jest-dom';

declare global {
    namespace jest {
        interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<typeof expect.stringContaining, R> { }
    }
}
