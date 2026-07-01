import { FetchError } from '@dhis2/app-runtime'

export const isFetchError = (error: unknown): error is FetchError => {
    return error instanceof FetchError
}

// Status codes returned by proxies/gateways when a long-running request is cut
// off before the backend has finished - the operation may still be completing
// server-side.
const MAYBE_STILL_PROCESSING_STATUS_CODES = [408, 502, 503, 504]

/**
 * Detects errors where the request failed but the operation may still be
 * completing on the server, eg. the connection dropped or a proxy returned a
 * gateway timeout while a long-running delete keeps running on the backend.
 * Used to avoid telling the user an operation failed when it might actually
 * succeed.
 */
export const isMaybeStillProcessingError = (error: unknown): boolean => {
    if (!isFetchError(error)) {
        return false
    }
    if (error.type === 'network' || error.type === 'aborted') {
        return true
    }
    const httpStatusCode = (error.details as { httpStatusCode?: number })
        ?.httpStatusCode
    return (
        httpStatusCode !== undefined &&
        MAYBE_STILL_PROCESSING_STATUS_CODES.includes(httpStatusCode)
    )
}

export type ModuleNotFoundError = Error & {
    code: 'MODULE_NOT_FOUND'
}

export const isModuleNotFoundError = (
    error: unknown
): error is ModuleNotFoundError => {
    // vite will throw this error when failing to find a module with dynamic variables
    if (
        (error as Error)?.message.startsWith('Unknown variable dynamic import')
    ) {
        return true
    }
    // webpack will throw an error with code
    return (error as ModuleNotFoundError)?.code === 'MODULE_NOT_FOUND'
}
