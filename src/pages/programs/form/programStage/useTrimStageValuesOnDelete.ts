import { useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useHandleOnSubmitEditFormDeletions } from '../../../../components/sectionedForm/useHandleOnSubmitEditFormDeletions'
import { SECTIONS_MAP } from '../../../../lib'
import { PartialStageFormValues } from './stageFormShared'

type DeletionResult = Awaited<
    ReturnType<ReturnType<typeof useHandleOnSubmitEditFormDeletions>>
>
type DeletionError = NonNullable<
    Extract<DeletionResult, { error: unknown }>['error']
>

type TrimResult<TValues> =
    | { trimmedValues: TValues; error?: undefined }
    | { trimmedValues?: undefined; error: DeletionError }

/* Deletes any sections / custom form marked for deletion, then returns the
   submitted values trimmed accordingly: deleted sections removed and
   dataEntryForm nullified when its delete succeeded. Shared by the in-program
   drawer (StageForm) and the standalone stage edit page (programStages/Edit) so
   the two stay in sync — see both call sites before changing the trim shape. */
export const useTrimStageValuesOnDelete = () => {
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const handleFormDeletions = useHandleOnSubmitEditFormDeletions(
        SECTIONS_MAP.programStage,
        'programStageSections',
        dataEngine,
        queryClient
    )

    return useCallback(
        async <TValues extends PartialStageFormValues>(
            values: TValues,
            form: { getState: () => { values: PartialStageFormValues } }
        ): Promise<TrimResult<TValues>> => {
            const formValues = form.getState().values
            const sections = formValues.programStageSections ?? []
            const dataEntryForm = formValues.dataEntryForm

            const { customFormDeleteResult, error } = await handleFormDeletions(
                sections,
                dataEntryForm
            )
            if (error) {
                return { error }
            }

            const trimmedValues = {
                ...values,
                programStageSections: sections.filter(
                    (formSection) => !formSection.deleted
                ),
                dataEntryForm:
                    customFormDeleteResult &&
                    customFormDeleteResult?.[0]?.status !== 'rejected'
                        ? null
                        : values.dataEntryForm,
            } as unknown as TValues

            return { trimmedValues }
        },
        [handleFormDeletions]
    )
}
