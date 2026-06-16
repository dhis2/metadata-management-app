import { useQuery } from '@tanstack/react-query'
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
import {
    getSectionPath,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitEdit,
} from '../../lib'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { useTrimStageValuesOnDelete } from '../programs/form/programStage/useTrimStageValuesOnDelete'
import {
    fieldFilters,
    StageFormContents,
    StageFormDescriptor,
    StageFormValues,
} from './form'

const section = SECTIONS_MAP.programStage

const editFieldFilters = [...fieldFilters, 'program[id,displayName]'] as const

const useOnSubmitStageEdit = (modelId: string) => {
    const submitEdit: EnhancedOnSubmit<StageFormValues> = useOnSubmitEdit({
        section,
        modelId,
    })
    const trimValuesOnDelete = useTrimStageValuesOnDelete()

    return useMemo<EnhancedOnSubmit<StageFormValues>>(
        () => async (values, form, options) => {
            const { trimmedValues, error } = await trimValuesOnDelete(
                values,
                form
            )
            if (error) {
                return error
            }

            return submitEdit(trimmedValues, form, options)
        },
        [submitEdit, trimValuesOnDelete]
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
                            <StageFormContents withProgramSelector />
                            <DefaultFormFooter
                                cancelTo={`/${getSectionPath(section)}`}
                            />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
