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
}

const section = SECTIONS_MAP.predictor

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'predictors',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }

    const predictorQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<PredictorFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<PredictorFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        return predictorQuery.data ? omit(predictorQuery.data, 'id') : undefined
    }, [predictorQuery.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
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
                            <CloneNoticeBox section={section} />
                            <PredictorFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/predictors" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
