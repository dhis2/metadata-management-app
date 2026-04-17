import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useEffect } from 'react'
import { useForm } from 'react-final-form'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { DuplicationNoticeBox } from '../../components/form/DuplicationNoticeBox'
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

const TriggerDuplicateValidation = () => {
    const form = useForm()
    useEffect(() => {
        form.getRegisteredFields().forEach((field) => {
            form.focus(field)
            form.blur(field)
        })
    }, [form])
    return null
}

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const duplicatedModelId = searchParams.get('duplicatedId') as string

    const query = {
        resource: 'indicators',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const indicatorQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<IndicatorFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(indicatorQuery.data, 'id')}
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
                            <DuplicationNoticeBox section={section} />
                            <TriggerDuplicateValidation />
                            <IndicatorFormFields />
                            <DefaultFormFooter cancelTo="/indicators" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
