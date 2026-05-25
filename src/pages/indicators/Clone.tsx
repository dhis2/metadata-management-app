import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
    TriggerCloneValidation,
    CloneNoticeBox,
} from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitNew,
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
] as const

const section = SECTIONS_MAP.indicator

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'indicators',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<IndicatorFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return indicatorQuery.data ? omit(indicatorQuery.data, 'id') : undefined
    }, [indicatorQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            subscription={{}}
            fetchError={!!indicatorQuery.error}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={IndicatorFormDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <IndicatorFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/indicators" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
