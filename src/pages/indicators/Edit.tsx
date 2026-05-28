import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitEditWithGroups,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { IndicatorFormDescriptor } from './form/formDescriptor'
import { IndicatorFormFields } from './form/IndicatorFormFields'
import { IndicatorFormValues, validate } from './form/indicatorSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'numerator',
    'numeratorDescription',
    'denominator',
    'indicatorType',
    'denominatorDescription',
    'annualized',
    'decimals',
    'url',
    'aggregateExportCategoryOptionCombo',
    'aggregateExportAttributeOptionCombo',
    'indicatorType[id,displayName]',
    'legendSets[id,displayName]',
    'style[color,icon]',
    'indicatorGroups[id,displayName]',
] as const

export const Component = () => {
    const modelId = useParams().id as string
    const section = SECTIONS_MAP.indicator
    const queryFn = useBoundResourceQueryFn()

    const query = {
        resource: 'indicators',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }

    const indicatorQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorFormValues>,
    })

    const initialValues = indicatorQuery.data

    return (
        <FormBase
            onSubmit={useOnSubmitEditWithGroups({
                section,
                modelId,
                groupResource: 'indicatorGroups',
            })}
            initialValues={initialValues}
            validate={validate}
            subscription={{}}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={IndicatorFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <IndicatorFormFields />
                                <DefaultFormFooter cancelTo="/indicators" />
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
