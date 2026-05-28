import { useDataEngine } from '@dhis2/app-runtime'
import { useCallback } from 'react'

export type GroupSyncError = {
    groupId: string
    op: 'add' | 'remove'
    error: unknown
}

export type GroupSyncResult = {
    ok: boolean
    errors: GroupSyncError[]
}

export type GroupSyncArgs = {
    modelId: string
    added: string[]
    removed: string[]
}

type UseSyncGroupMembershipConfig = {
    resource: string
    groupResource: string
}

export const useSyncGroupMembership = (
    config?: UseSyncGroupMembershipConfig
) => {
    const dataEngine = useDataEngine()

    return useCallback(
        async ({
            modelId,
            added,
            removed,
        }: GroupSyncArgs): Promise<GroupSyncResult> => {
            if (!config || (added.length === 0 && removed.length === 0)) {
                return { ok: true, errors: [] }
            }

            const collectionResource = `${config.resource}/${modelId}/${config.groupResource}`

            const addPromises = added.map((groupId) =>
                dataEngine
                    .mutate({
                        resource: `${collectionResource}/${groupId}`,
                        type: 'create',
                        data: {},
                    })
                    .then(
                        () => ({
                            ok: true as const,
                            groupId,
                            op: 'add' as const,
                        }),
                        (error: unknown) => ({
                            ok: false as const,
                            groupId,
                            op: 'add' as const,
                            error,
                        })
                    )
            )

            const removePromises = removed.map((groupId) =>
                dataEngine
                    .mutate({
                        resource: collectionResource,
                        id: groupId,
                        type: 'delete',
                    })
                    .then(
                        () => ({
                            ok: true as const,
                            groupId,
                            op: 'remove' as const,
                        }),
                        (error: unknown) => ({
                            ok: false as const,
                            groupId,
                            op: 'remove' as const,
                            error,
                        })
                    )
            )

            const results = await Promise.all([
                ...addPromises,
                ...removePromises,
            ])

            const errors: GroupSyncError[] = results
                .filter(
                    (r): r is Extract<typeof r, { ok: false }> => r.ok === false
                )
                .map(({ groupId, op, error }) => ({ groupId, op, error }))

            return { ok: errors.length === 0, errors }
        },
        [dataEngine, config?.resource, config?.groupResource]
    )
}
