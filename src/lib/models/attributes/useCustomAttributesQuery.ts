import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { Section } from '../../../types'
import { Attribute, PickWithFieldFilters } from '../../../types/generated'
import { useSectionHandle } from '../../routeUtils'

const attributeFields = [
    'id',
    'mandatory',
    'displayFormName',
    'valueType',
    'optionSet[options[id,displayName,name,code]]',
    'sortOrder',
] as const

export type AttributeMetadata = PickWithFieldFilters<
    Attribute,
    typeof attributeFields
>

const CUSTOM_ATTRIBUTES_QUERY = {
    attributes: {
        resource: 'attributes',
        params: ({ modelName }: Record<string, string>) => ({
            fields: attributeFields.concat(),
            paging: false,
            filter: `${modelName}Attribute:eq:true`,
        }),
    },
}

interface QueryResponse {
    attributes: {
        attributes: AttributeMetadata[]
    }
}

type UseCustomAttributesQueryOptions = {
    enabled?: boolean
    section?: Section
}
export function useCustomAttributesQuery({
    enabled = true,
    section,
}: UseCustomAttributesQueryOptions = {}) {
    const schemaSection = useSectionHandle()
    const customAttributes = useDataQuery<QueryResponse>(
        CUSTOM_ATTRIBUTES_QUERY,
        {
            lazy: !enabled,
            variables: { modelName: section?.name ?? schemaSection?.name },
        }
    )

    return useMemo(
        () => ({
            ...customAttributes,
            data: customAttributes.data?.attributes.attributes || [],
        }),
        [customAttributes]
    )
}
