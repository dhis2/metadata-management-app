import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { SharingDialog } from '@dhis2/ui'
import { useQueryClient } from '@tanstack/react-query'
import React, { useCallback, useMemo, useState } from 'react'
import { useFormState } from 'react-final-form'
import { useParams } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import type { SharingSettings } from '../../../../lib'
import { areSharingPropertiesSimilar } from '../../../../lib'
import type { ProgramValues } from '../../EditTrackerProgram'
import css from './RoleAccess.module.css'
import { RoleAccessBox } from './RoleAccessBox'

type ProgramStageWithSharing = {
    id: string
    displayName: string
    sharing?: SharingSettings
}

type SharingDialogState = {
    type: 'program' | 'programStage'
    id: string
} | null

type RoleAccessProps = {
    showStageAccess?: boolean
}

export const RoleAccess = ({
    showStageAccess = true,
}: RoleAccessProps = {}) => {
    const { values } = useFormState<ProgramValues>()
    const { id: programId } = useParams()
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const { show: showSuccess } = useAlert(
        i18n.t('Access updated successfully'),
        { success: true }
    )
    const { show: showError } = useAlert((message: string) => message, {
        critical: true,
    })

    const [sharingDialog, setSharingDialog] = useState<SharingDialogState>(null)

    const programStages = useMemo(
        () => (values.programStages || []) as ProgramStageWithSharing[],
        [values.programStages]
    )

    const handleApplyToAllStages = useCallback(async () => {
        if (!programId) {
            return
        }

        try {
            const { sharing } = (await dataEngine.query({
                sharing: {
                    resource: 'sharing',
                    params: { type: 'program', id: programId },
                },
            })) as { sharing: { object: SharingSettings } }

            await Promise.all(
                programStages.map((stage) => {
                    // @ts-expect-error id passes as a param instead of in data.object, so type doesn't match
                    return dataEngine.mutate({
                        resource: 'sharing',
                        type: 'update',
                        params: { type: 'programStage', id: stage.id },
                        data: {
                            meta: {
                                allowPublicAccess: true,
                                allowExternalAccess: true,
                            },
                            object: {
                                ...sharing.object,
                                id: stage.id,
                                displayName: stage.displayName,
                            },
                        },
                    })
                })
            )

            showSuccess()
            queryClient.invalidateQueries({
                queryKey: [{ resource: 'programs', id: programId }],
            })
        } catch (error) {
            showError(
                error instanceof Error
                    ? error.message
                    : i18n.t('Failed to apply access to all stages')
            )
        }
    }, [
        programId,
        programStages,
        dataEngine,
        queryClient,
        showSuccess,
        showError,
    ])

    const handleApplyProgramAccessRules = useDebouncedCallback(
        async (stageId: string) => {
            if (!programId) {
                return
            }

            const stage = programStages.find((s) => s.id === stageId)
            if (!stage) {
                return
            }

            try {
                const { sharing } = (await dataEngine.query({
                    sharing: {
                        resource: 'sharing',
                        params: { type: 'program', id: programId },
                    },
                })) as { sharing: { object: SharingSettings } }

                // @ts-expect-error id passes as a param instead of in data.object, so type doesn't match
                await dataEngine.mutate({
                    resource: 'sharing',
                    type: 'update',
                    params: { type: 'programStage', id: stageId },
                    data: {
                        meta: {
                            allowPublicAccess: true,
                            allowExternalAccess: true,
                        },
                        object: {
                            ...sharing.object,
                            id: stageId,
                            displayName: stage.displayName,
                        },
                    },
                })

                showSuccess()
                queryClient.invalidateQueries({
                    queryKey: [{ resource: 'programs', id: programId }],
                })
            } catch (error) {
                showError(
                    error instanceof Error
                        ? error.message
                        : i18n.t('Failed to apply program access rules')
                )
            }
        },
        250
    )

    const handleSaveSharing = useCallback(() => {
        if (programId) {
            queryClient.invalidateQueries({
                queryKey: [{ resource: 'programs', id: programId }],
            })
        }
    }, [programId, queryClient])

    return (
        <>
            <div className={css.container}>
                <RoleAccessBox
                    title={i18n.t('Program: {{name}}', {
                        name: values.name || i18n.t('Untitled'),
                    })}
                    type="program"
                    sharing={values.sharing}
                    onApplyToAllStages={
                        showStageAccess ? handleApplyToAllStages : undefined
                    }
                    onEditAccess={() =>
                        setSharingDialog({ type: 'program', id: values.id })
                    }
                />

                {showStageAccess &&
                    programStages.map((stage) => (
                        <RoleAccessBox
                            key={stage.id}
                            title={i18n.t('Stage: {{name}}', {
                                name: stage.displayName,
                            })}
                            type="stage"
                            sharing={stage.sharing}
                            isDifferentFromProgram={
                                !areSharingPropertiesSimilar(
                                    stage.sharing,
                                    values.sharing
                                )
                            }
                            onApplyProgramAccessRules={() =>
                                handleApplyProgramAccessRules(stage.id)
                            }
                            onEditAccess={() =>
                                setSharingDialog({
                                    type: 'programStage',
                                    id: stage.id,
                                })
                            }
                        />
                    ))}
            </div>

            {sharingDialog && (
                <div onSubmit={(e) => e.stopPropagation()}>
                    <SharingDialog
                        type={sharingDialog.type}
                        id={sharingDialog.id}
                        onClose={() => {
                            setSharingDialog(null)
                            handleSaveSharing()
                        }}
                        dataSharing
                        metadataSharing={sharingDialog.type !== 'programStage'}
                    />
                </div>
            )}
        </>
    )
}
