import { useDataEngine } from '@dhis2/app-runtime'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { ApiErrorReport, parseErrorResponse } from '../../../lib'
import { ImportSummary } from '../../../types'

type MutationFnArgs = {
    ids: string[]
}

export type BulkDeleteResult =
    | { id: string; status: 'fulfilled' }
    | { id: string; status: 'rejected'; error: ApiErrorReport }

type Options = Omit<
    UseMutationOptions<BulkDeleteResult[], unknown, MutationFnArgs>,
    'mutationFn'
>

export function useBulkDeleteMutation(
    schemaResource: string,
    options?: Options
) {
    const engine = useDataEngine()

    return useMutation({
        ...options,
        mutationFn: async ({ ids }: MutationFnArgs) => {
            const settled = await Promise.allSettled(
                ids.map(
                    (id) =>
                        engine.mutate({
                            resource: schemaResource,
                            id,
                            type: 'delete',
                        }) as Promise<ImportSummary>
                )
            )

            return settled.map(
                (result, index): BulkDeleteResult =>
                    result.status === 'fulfilled'
                        ? { id: ids[index], status: 'fulfilled' }
                        : {
                              id: ids[index],
                              status: 'rejected',
                              error: parseErrorResponse(result.reason),
                          }
            )
        },
    })
}
