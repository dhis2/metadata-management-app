import i18n from '@dhis2/d2-i18n'
import { ErrorMessage, ErrorReport, webMessageSchema } from './apiErrorSchemas'
import { isFetchError } from './errors'

/* Discriminated union types to be able to easily get the type for the "original"-prop
for common error-types through the errorType property */
export type ErrorType = 'errorReport' | 'mergeReport' | 'unknown'
export interface BaseApiError {
    message: string
    args: string[]
    original: unknown
    errorType: ErrorType
}
export interface UnknownError extends BaseApiError {
    errorType: 'unknown'
    original: unknown
}
export interface ErrorReportError extends BaseApiError {
    errorType: 'errorReport'
    original: ErrorReport
}

export interface MergeReportError extends BaseApiError {
    errorType: 'mergeReport'
    original: ErrorMessage
}
export type ApiError = ErrorReportError | MergeReportError | UnknownError

// the backend have a lot of different error structures
// so we parse them into a common structure
export type ApiErrorReport = {
    message: string
    httpStatus: string
    httpStatusCode: number
    original: unknown
    errors: ApiError[]
}

const createApiError = <T extends ApiError>(error: Partial<T>): T => {
    return {
        message: error.message || i18n.t('Unknown error'),
        args: error.args || [],
        original: error.original,
        errorType: error.errorType ?? 'unknown',
    } as T
}

const createErrorReport = (report: Partial<ApiErrorReport>): ApiErrorReport => {
    const res = {
        message: report.message || i18n.t('An unknown error occurred'),
        httpStatus: report.httpStatus || i18n.t('Unknown'),
        httpStatusCode: report.httpStatusCode || 0,
        original: report.original || {},
        errors: report.errors || [],
    }
    return res
}

const createFallbackError = (error: unknown): ApiErrorReport => {
    let message = 'An unknown error occurred'
    try {
        message = (error as Error).message
    } catch (e) {
        console.error('Failed to parse error message', e)
    }

    return createErrorReport({
        message,
        original: error,
    })
}

export const isApiErrorReport = (error: unknown): error is ApiErrorReport => {
    if (typeof error !== 'object' || error === null) {
        return false
    }
    if (
        'message' in error &&
        'httpStatus' in error &&
        'httpStatusCode' in error &&
        'original' in error &&
        'errors' in error
    ) {
        return true
    }
    return false
}

/**
 * Ensure that error is of type ApiErrorReport
 * If not, create a fallback error of type ApiErrorReport
 */
export const ensureApiErrorReport = (
    error: unknown
): ApiErrorReport | undefined => {
    if (error == undefined) {
        return undefined
    }
    if (isApiErrorReport(error)) {
        return error
    }
    return createFallbackError(error)
}

export const parseErrorResponse = (errorResponse: unknown): ApiErrorReport => {
    const error = isFetchError(errorResponse)
        ? errorResponse.details
        : errorResponse
    const parsed = webMessageSchema.safeParse(error)

    if (parsed.success && parsed.data.response) {
        const response = parsed.data.response
        if ('mergeReport' in response) {
            const errors = response?.mergeReport?.mergeErrors?.map((error) =>
                createApiError({
                    message: error.message,
                    args: error.args,
                    original: error,
                    errorType: 'mergeReport',
                } as const)
            )

            return createErrorReport({
                message: parsed.data.message,
                httpStatus: parsed.data.httpStatus,
                httpStatusCode: parsed.data.httpStatusCode,
                original: parsed.data,
                errors: errors,
            })
        }
        if ('errorReports' in response) {
            const errors = response.errorReports?.map((error) =>
                createApiError({
                    message: error.message,
                    args: error.args,
                    original: error,
                    errorType: 'errorReport',
                } as const)
            )
            return createErrorReport({
                message: parsed.data.message,
                httpStatus: parsed.data.httpStatus,
                httpStatusCode: parsed.data.httpStatusCode,
                original: parsed.data,
                errors: errors,
            })
        }
    }

    const webMessage = webMessageSchema
        .omit({ response: true })
        .safeParse(error)
    if (webMessage.success) {
        return createErrorReport({
            message: webMessage.data.message,
            httpStatus: webMessage.data.httpStatus,
            httpStatusCode: webMessage.data.httpStatusCode,
            original: webMessage.data,
        })
    }
    return createFallbackError(error)
}
