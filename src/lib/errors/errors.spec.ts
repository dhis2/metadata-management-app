import { FetchError } from '@dhis2/app-runtime'
import { isMaybeStillProcessingError } from './errors'

const fetchError = ({
    type,
    message = 'error',
    httpStatusCode,
}: {
    type: FetchError['type']
    message?: string
    httpStatusCode?: number
}): FetchError => new FetchError({ type, message, details: { httpStatusCode } })

describe('isMaybeStillProcessingError', () => {
    it('returns true for network errors', () => {
        expect(
            isMaybeStillProcessingError(fetchError({ type: 'network' }))
        ).toBe(true)
    })

    it('returns true for aborted requests', () => {
        expect(
            isMaybeStillProcessingError(fetchError({ type: 'aborted' }))
        ).toBe(true)
    })

    it.each([408, 502, 503, 504])(
        'returns true when the JSON body reports gateway/timeout status %s',
        (httpStatusCode) => {
            expect(
                isMaybeStillProcessingError(
                    fetchError({ type: 'unknown', httpStatusCode })
                )
            ).toBe(true)
        }
    )

    // A reverse-proxy gateway timeout returns a non-JSON body, so app-runtime
    // leaves details empty and the status survives only in the message,
    // formatted as "...statusText (504)".
    it.each([408, 502, 503, 504])(
        'returns true for a proxy timeout where status %s is only in the message',
        (status) => {
            expect(
                isMaybeStillProcessingError(
                    fetchError({
                        type: 'unknown',
                        message: `An unknown error occurred - Gateway Timeout (${status})`,
                    })
                )
            ).toBe(true)
        }
    )

    it.each([400, 401, 403, 404, 409, 500])(
        'returns false for regular error status code %s',
        (status) => {
            expect(
                isMaybeStillProcessingError(
                    fetchError({
                        type: 'unknown',
                        httpStatusCode: status,
                        message: `An unknown error occurred - Error (${status})`,
                    })
                )
            ).toBe(false)
        }
    )

    it('returns false for an unknown error with no status code', () => {
        expect(
            isMaybeStillProcessingError(fetchError({ type: 'unknown' }))
        ).toBe(false)
    })

    it('returns false for non-FetchError values', () => {
        expect(isMaybeStillProcessingError(new Error('boom'))).toBe(false)
        expect(isMaybeStillProcessingError(undefined)).toBe(false)
        expect(isMaybeStillProcessingError(null)).toBe(false)
    })
})
