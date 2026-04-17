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
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters, Predictor } from '../../types/generated'
import { PredictorFormDescriptor } from './form/formDescriptor'
import { PredictorFormFields } from './form/PredictorFormFields'
import { validate } from './form/predictorSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'periodType',
    'output',
    'outputCombo[id,displayName,categoryCombo[id,displayName,isDefault]]',
    'organisationUnitDescendants',
    'sequentialSampleCount',
    'annualSampleCount',
    'sequentialSkipCount',
    'generator',
    'sampleSkipTest',
    'organisationUnitLevels[id,displayName]',
] as const

export type PredictorFormValues = PickWithFieldFilters<
    Predictor,
    typeof fieldFilters
> & {
    id: string
    attributeValues?: { attribute: { id: string }; value: string }[]
}

const section = SECTIONS_MAP.predictor

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
        resource: 'predictors',
        id: duplicatedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }

    const predictorQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<PredictorFormValues>,
    })

    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={omit(predictorQuery.data, 'id')}
            validate={validate}
            subscription={{}}
            includeAttributes={false}
            fetchError={!!predictorQuery.error}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={PredictorFormDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <DuplicationNoticeBox section={section} />
                            <TriggerDuplicateValidation />
                            <PredictorFormFields />
                            <DefaultFormFooter cancelTo="/predictors" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
