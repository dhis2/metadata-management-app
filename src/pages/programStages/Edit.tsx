import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { useHandleOnSubmitEditFormDeletions } from '../../components/sectionedForm/useHandleOnSubmitEditFormDeletions'
import {
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitEdit,
} from '../../lib'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import {
    fieldFilters,
    StageFormContents,
    StageFormDescriptor,
    StageFormValues,
} from './form'
import { StageProgramField } from './StageProgramField'

const section = SECTIONS_MAP.programStage

/* The drawer loads the stage without the program (it is implied by the route).
   Standalone we need the program to populate the required program selector. */
const editFieldFilters = [...fieldFilters, 'program[id,displayName]'] as const

const useOnSubmitStageEdit = (modelId: string) => {
    const submitEdit: EnhancedOnSubmit<StageFormValues> = useOnSubmitEdit({
        section,
        modelId,
    })
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const handleFormDeletions = useHandleOnSubmitEditFormDeletions(
        section,
        'programStageSections',
        dataEngine,
        queryClient
    )

    return useMemo<EnhancedOnSubmit<StageFormValues>>(
        () => async (values, form, options) => {
            const formValues = form.getState().values
            const sections = formValues.programStageSections ?? []
            const dataEntryForm = formValues.dataEntryForm

            const { customFormDeleteResult, error } = await handleFormDeletions(
                sections,
                dataEntryForm
            )
            if (error) {
                return error
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
            } as StageFormValues

            return submitEdit(trimmedValues, form, options)
        },
        [submitEdit, handleFormDeletions]
    )
}

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const stage = useQuery({
        queryFn: queryFn<StageFormValues>,
        queryKey: [
            {
                resource: 'programStages',
                id: modelId,
                params: {
                    fields: editFieldFilters.concat(),
                },
            },
        ] as const,
    })

    const onSubmit = useOnSubmitStageEdit(modelId)

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={stage.data}
            subscription={{}}
            mutators={{ ...arrayMutators }}
            fetchError={stage.isError}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={StageFormDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <StageFormContents
                                programField={<StageProgramField />}
                            />
                            <DefaultFormFooter />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
