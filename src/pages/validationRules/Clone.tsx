import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    CloneNoticeBox,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
    TriggerCloneValidation,
} from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters, ValidationRule } from '../../types/generated'
import { ValidationRuleFormDescriptor } from './form/formDescriptor'
import ValidationRuleFormFields from './form/ValidationRuleFormFields'
import { validate } from './form/validationRuleSchema'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'description',
    'leftSide[expression,description,missingValueStrategy,slidingWindow]',
    'operator',
    'rightSide[expression,description,missingValueStrategy,slidingWindow]',
    'instruction',
    'periodType',
    'importance',
    'skipFormValidation',
    'organisationUnitLevels',
] as const

export type ValidationRuleFormValues = PickWithFieldFilters<
    ValidationRule,
    typeof fieldFilters
> & { id: string }

const section = SECTIONS_MAP.validationRule

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'validationRules',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const validationRuleQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ValidationRuleFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<ValidationRuleFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () =>
            validationRuleQuery.data
                ? omit(validationRuleQuery.data, 'id')
                : undefined,
        [validationRuleQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!validationRuleQuery.error}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider
                    formDescriptor={ValidationRuleFormDescriptor}
                >
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <ValidationRuleFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/validationRules" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
