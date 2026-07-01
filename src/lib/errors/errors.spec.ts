import { FetchError } from '@dhis2/app-runtime'
import { isMaybeStillProcessingError } from './errors'

const fetchError = (
    type: FetchError['type'],
    httpStatusCode?: number
): FetchError =>
    new FetchError({
        type,
        message: 'error',
        details: { httpStatusCode } as FetchError['details'],
    })

describe('isMaybeStillProcessingError', () => {
    it('returns true for network errors', () => {
        expect(isMaybeStillProcessingError(fetchError('network'))).toBe(true)
    })

    it('returns true for aborted requests', () => {
        expect(isMaybeStillProcessingError(fetchError('aborted'))).toBe(true)
    })

    it.each([408, 502, 503, 504])(
        'returns true for gateway/timeout status code %s',
        (httpStatusCode) => {
            expect(
                isMaybeStillProcessingError(
                    fetchError('unknown', httpStatusCode)
                )
            ).toBe(true)
        }
    )

    it.each([400, 401, 403, 404, 409, 500])(
        'returns false for regular error status code %s',
        (httpStatusCode) => {
            expect(
                isMaybeStillProcessingError(
                    fetchError('unknown', httpStatusCode)
                )
            ).toBe(false)
        }
    )

    it('returns false for non-FetchError values', () => {
        expect(isMaybeStillProcessingError(new Error('boom'))).toBe(false)
        expect(isMaybeStillProcessingError(undefined)).toBe(false)
        expect(isMaybeStillProcessingError(null)).toBe(false)
    })
})
