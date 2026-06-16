import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { DrawerRoot } from '../../components/drawer/Drawer'
import { DefaultFormFooter } from '../../components/form/DefaultFormFooter'
import { Section } from '../../components/formCreators/SectionFormList'
import { useHandleOnSubmitEditFormDeletions } from '../../components/sectionedForm/useHandleOnSubmitEditFormDeletions'
import {
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitEdit,
} from '../../lib'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters, DataSet } from '../../types/generated'
import { DataSetFormContents } from './form/DataSetFormContents'
import { validate } from './form/dataSetFormSchema'
import { DataSetFormDescriptor } from './form/formDescriptor'
import { dataSetValueFormatter } from './New'
const section = SECTIONS_MAP.dataSet
const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ':owner',
    'organisationUnits[id,displayName,path]',
    'dataSetElements[dataElement[id,displayName,categoryCombo[id,displayName]],categoryCombo[id,displayName]]',
    'style[color,icon]',
    'indicators[id,displayName]',
    'compulsoryDataElementOperands[id,displayName,dataElement[id,displayName],categoryOptionCombo[id,displayName]]',
    'categoryCombo[id,displayName]',
    'openFuturePeriods',
    'expiryDays',
    'openPeriodsAfterCoEndDate',
    'formType',
    'displayOptions',
    'legendSets[id,displayName]',
    'dataEntryForm[id,displayName,htmlCode]',
    'sections[id,displayName,description,access]',
] as const

type DataSetValuesFromFilters = PickWithFieldFilters<
    DataSet,
    typeof fieldFilters
>
export type DataSetValues = Omit<
    DataSetValuesFromFilters,
    'sections' | 'dataEntryForm'
> & {
    sections: Section[]
    dataEntryForm?: {
        id: string
        customHTML: string
        deleted?: boolean
    }
}

export const useOnSubmitDataSetsEdit = (modelId: string) => {
    const submitEdit: EnhancedOnSubmit<DataSetValues> = useOnSubmitEdit({
        section,
        modelId,
    })
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()

    const handleDeletions = useHandleOnSubmitEditFormDeletions(
        section,
        'sections',
        dataEngine,
        queryClient
    )

    return useMemo<EnhancedOnSubmit<DataSetValues>>(
        () => async (values, form, options) => {
            const formValues = form.getState().values
            const sections = formValues.sections
            const dataEntryForm = formValues.dataEntryForm

            const { customFormDeleteResult, error } = await handleDeletions(
                sections,
                dataEntryForm
            )

            if (error) {
                return error
            }
            const trimmedValues = {
                ...values,
                dataEntryForm:
                    customFormDeleteResult &&
                    customFormDeleteResult?.[0]?.status !== 'rejected'
                        ? null
                        : values.dataEntryForm,
            } as DataSetValues

            return submitEdit(trimmedValues, form, options)
        },
        [submitEdit, handleDeletions]
    )
}

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string
    const dataSetValues = useQuery({
        queryFn: queryFn<DataSetValues>,
        queryKey: [
            {
                resource: 'dataSets',
                id: modelId,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ] as const,
    })

    const initialValues = useMemo(
        () =>
            dataSetValues.data && {
                ...dataSetValues.data,
                displayOptions:
                    dataSetValues.data?.displayOptions &&
                    (typeof dataSetValues.data.displayOptions === 'string'
                        ? JSON.parse(dataSetValues.data.displayOptions)
                        : dataSetValues.data.displayOptions),
            },
        [dataSetValues.data]
    )
    return (
        <FormBase
            valueFormatter={dataSetValueFormatter}
            onSubmit={useOnSubmitDataSetsEdit(modelId)}
            initialValues={initialValues}
            validate={validate}
            subscription={{}}
            mutators={{ ...arrayMutators }}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={DataSetFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <DataSetFormContents />
                                <DefaultFormFooter />
                            </form>
                            <DrawerRoot />
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
