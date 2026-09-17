import { FetchError, useDataEngine } from '@dhis2/app-runtime'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { useBulkDeleteMutation } from './useBulkDeleteMutation'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    useDataEngine: jest.fn(),
}))

const mockedUseDataEngine = jest.mocked(useDataEngine)

const renderMutationHook = () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
    return renderHook(() => useBulkDeleteMutation('dataElements'), { wrapper })
}

describe('useBulkDeleteMutation', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('resolves with a fulfilled result for every successfully deleted id', async () => {
        const mutate = jest.fn().mockResolvedValue({ httpStatusCode: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockedUseDataEngine.mockReturnValue({ mutate } as any)

        const { result } = renderMutationHook()
        result.current.mutate({ ids: ['id1', 'id2'] })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual([
            { id: 'id1', status: 'fulfilled' },
            { id: 'id2', status: 'fulfilled' },
        ])
    })

    it('does not short-circuit on a single failure and reports per-id outcomes', async () => {
        const rejection = new FetchError({
            type: 'unknown',
            message: 'Conflict',
            details: {
                httpStatusCode: 409,
                status: 'ERROR',
                message: 'Conflict',
                response: {
                    responseType: 'ObjectReportWebMessageResponse',
                    klass: 'org.hisp.dhis.dataelement.DataElement',
                    uid: 'id2',
                    errorReports: [
                        {
                            errorCode: 'E4030',
                            message: 'Object is referenced by another object',
                            mainKlass: 'org.hisp.dhis.program.Program',
                            mainId: 'program1',
                            errorProperties: [],
                            value: null,
                        },
                    ],
                },
            },
        })
        const mutate = jest
            .fn()
            .mockResolvedValueOnce({ httpStatusCode: 200 })
            .mockRejectedValueOnce(rejection)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockedUseDataEngine.mockReturnValue({ mutate } as any)

        const { result } = renderMutationHook()
        result.current.mutate({ ids: ['id1', 'id2'] })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data?.[0]).toEqual({
            id: 'id1',
            status: 'fulfilled',
        })
        expect(result.current.data?.[1]).toMatchObject({
            id: 'id2',
            status: 'rejected',
        })
        const rejected = result.current.data?.[1]
        if (rejected?.status === 'rejected') {
            expect(rejected.error.errors[0]).toMatchObject({
                message: 'Object is referenced by another object',
                errorType: 'errorReport',
            })
        }
    })
})
