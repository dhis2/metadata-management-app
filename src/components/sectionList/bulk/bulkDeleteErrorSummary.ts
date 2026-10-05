import i18n from '@dhis2/d2-i18n'
import { ApiErrorReport } from '../../../lib'

export const getBulkDeleteErrorSummary = (error: ApiErrorReport): string => {
    if (error.httpStatusCode === 403) {
        return i18n.t('You do not have permission to delete this item')
    }
    if (error.httpStatusCode === 404) {
        return i18n.t('Not found, it may already have been deleted')
    }
    return i18n.t('Cannot be deleted')
}

export const getBulkDeleteErrorDetails = (error: ApiErrorReport): string[] =>
    error.errors.length > 0
        ? error.errors.map((apiError) => apiError.message)
        : [error.message]
