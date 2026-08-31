import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CloneNoticeBox, TriggerCloneValidation } from '../../components'
import {
    DEFAULT_FIELD_FILTERS,
    SECTIONS_MAP,
    useOnSubmitNew,
    getSectionPath,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { PickWithFieldFilters } from '../../types/generated'
import { ValidationNotificationTemplate } from '../../types/models'
import { ValidationNotificationTemplateFormFields, validate } from './form'
import { SectionedFormWrapper } from './SectionedFormWrapper'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'validationRules[id,displayName]',
    'sendStrategy',
    'subjectTemplate',
    'messageTemplate',
    'recipientUserGroups[id,displayName]',
    'notifyUsersInHierarchyOnly',
] as const

type ValidationNotificationTemplateFormValues = PickWithFieldFilters<
    ValidationNotificationTemplate,
    typeof fieldFilters
>

const section = SECTIONS_MAP.validationNotificationTemplate

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'validationNotificationTemplates',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const validationNotificationTemplateQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ValidationNotificationTemplateFormValues>,
    })

    const onSubmit = useOnSubmitNew<ValidationNotificationTemplateFormValues>({
        section,
    })

    const initialValues = useMemo(
        () =>
            validationNotificationTemplateQuery.data
                ? (omit(
                      validationNotificationTemplateQuery.data,
                      'id'
                  ) as ValidationNotificationTemplate)
                : undefined,
        [validationNotificationTemplateQuery.data]
    )

    return (
        <SectionedFormWrapper
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            cancelTo={`/${getSectionPath(section)}`}
            fetchError={!!validationNotificationTemplateQuery.error}
        >
            <>
                <CloneNoticeBox section={section} />
                <ValidationNotificationTemplateFormFields />
                <TriggerCloneValidation />
            </>
        </SectionedFormWrapper>
    )
}
