import { useDataEngine } from '@dhis2/app-runtime'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { ImportSummary } from '../../../types'

type MutationFnArgs = {
    ids: string[]
}

type Options = Omit<
    UseMutationOptions<ImportSummary[], unknown, MutationFnArgs>,
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
                ids.map(
                    (id) =>
                        engine.mutate({
                            resource: schemaResource,
                            id,
                            type: 'delete',
                        }) as Promise<ImportSummary>
                )
            ),
    })
}
