import { ApiErrorReport } from '../../../lib'
import {
    getBulkDeleteErrorDetails,
    getBulkDeleteErrorSummary,
} from './bulkDeleteErrorSummary'

const createReport = (
    report: Partial<ApiErrorReport> = {}
): ApiErrorReport => ({
    message: 'Conflict',
    httpStatus: 'Conflict',
    httpStatusCode: 409,
    original: {},
    errors: [],
    ...report,
})

describe('getBulkDeleteErrorSummary', () => {
    it('explains permission errors', () => {
        expect(
            getBulkDeleteErrorSummary(createReport({ httpStatusCode: 403 }))
        ).toBe('You do not have permission to delete this item')
    })

    it('explains not found errors', () => {
        expect(
            getBulkDeleteErrorSummary(createReport({ httpStatusCode: 404 }))
        ).toBe('Not found, it may already have been deleted')
    })

    it('falls back to a generic message for other errors', () => {
        expect(getBulkDeleteErrorSummary(createReport())).toBe(
            'Cannot be deleted'
        )
    })
})

describe('getBulkDeleteErrorDetails', () => {
    it('returns the individual error messages', () => {
        expect(
            getBulkDeleteErrorDetails(
                createReport({
                    errors: [
                        {
                            errorType: 'unknown',
                            message: 'Object is referenced',
                            args: [],
                            original: {},
                        },
                    ],
                })
            )
        ).toEqual(['Object is referenced'])
    })

    it('falls back to the report message when there are no errors', () => {
        expect(getBulkDeleteErrorDetails(createReport())).toEqual(['Conflict'])
    })
})
