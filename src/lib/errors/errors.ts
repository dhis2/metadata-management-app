import { FetchError } from '@dhis2/app-runtime'

export const isFetchError = (error: unknown): error is FetchError => {
    return error instanceof FetchError
}

// Status codes returned by proxies/gateways when a long-running request is cut
// off before the backend has finished - the operation may still be completing
// server-side.
const MAYBE_STILL_PROCESSING_STATUS_CODES: readonly number[] = [
    408, 502, 503, 504,
]

/**
 * Extracts the HTTP status code from a FetchError.
 *
 * app-runtime only populates `details.httpStatusCode` when the error response
 * body is DHIS2 JSON. A reverse-proxy gateway timeout returns a non-JSON (eg.
 * HTML) body, so `details` is left empty and the status survives only in the
 * message, which app-runtime formats as "...statusText (504)".
 */
const getHttpStatusCode = (error: FetchError): number | undefined => {
    if (typeof error.details.httpStatusCode === 'number') {
        return error.details.httpStatusCode
    }
    const match = error.message.match(/\((\d{3})\)\s*$/)
    return match ? Number(match[1]) : undefined
}

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
    const httpStatusCode = getHttpStatusCode(error)
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
