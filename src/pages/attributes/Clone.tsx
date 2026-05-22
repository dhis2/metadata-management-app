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
import { Attribute } from '../../types/models'
import { AttributeFormFields, ATTRIBUTE_BOOLEANS, validate } from './form'
import { SectionedFormWrapper } from './SectionedFormWrapper'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_BOOLEANS,
    'name',
    'description',
    'code',
    'shortName',
    'mandatory',
    'unique',
    'valueType',
    'optionSet',
    'sortOrder',
] as const

type AttributeFormValues = PickWithFieldFilters<Attribute, typeof fieldFilters>

const section = SECTIONS_MAP.attribute

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'attributes',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const attributesQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<AttributeFormValues>,
    })
    const onSubmit = useOnSubmitNew<Attribute>({ section })

    const initialValues = useMemo(
        () =>
            attributesQuery.data
                ? (omit(attributesQuery.data, 'id') as Attribute)
                : undefined,
        [attributesQuery.data]
    )

    return (
        <SectionedFormWrapper
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            cancelTo={`/${getSectionPath(section)}`}
            fetchError={!!attributesQuery.error}
        >
            <>
                <CloneNoticeBox section={section} />
                <AttributeFormFields initialValues={initialValues} />
                <TriggerCloneValidation />
            </>
        </SectionedFormWrapper>
    )
}
