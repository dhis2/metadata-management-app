import { useDataEngine } from '@dhis2/app-runtime'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { ApiErrorReport, parseErrorResponse } from '../../../lib'

type MutationFnArgs = {
    ids: string[]
}

export type BulkDeleteResult =
    | { id: string; status: 'deleted' }
    | { id: string; status: 'failed'; error: ApiErrorReport }

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
        mutationFn: ({ ids }: MutationFnArgs) =>
            Promise.all(
                ids.map(async (id): Promise<BulkDeleteResult> => {
                    try {
                        await engine.mutate({
                            resource: schemaResource,
                            id,
                            type: 'delete',
                        })
                        return { id, status: 'deleted' }
                    } catch (error) {
                        return {
                            id,
                            status: 'failed',
                            error: parseErrorResponse(error),
                        }
                    }
                })
            ),
    })
}
