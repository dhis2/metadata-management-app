import React from 'react'
import { useFormState } from 'react-final-form'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'

function getOptionSetId(
    values: Record<string, { optionSet?: { id: string } } | undefined>
): string | undefined {
    const de = values.dataElement
    const tea = values.trackedEntityAttribute
    return de?.optionSet?.id ?? tea?.optionSet?.id
}

export function OptionGroupField({
    label,
    required,
}: Readonly<{
    label: string
    required?: boolean
}>) {
    const { values } = useFormState({ subscription: { values: true } })
    const optionSetId = getOptionSetId(
        values as Record<string, { optionSet?: { id: string } } | undefined>
    )

    const disabled = !optionSetId
    const OPTION_GROUPS_QUERY = {
        resource: 'optionGroups' as const,
        params: {
            fields: ['id', 'displayName'],
            filter: [`optionSet.id:eq:${optionSetId}`, 'name:neq:default'],
            paging: false,
        },
    }
    return (
        <ModelSingleSelectFormField
            label={label}
            required={required}
            disabled={disabled}
            query={OPTION_GROUPS_QUERY}
            clearable={!required}
            name={'optionGroup'}
            format={(value) => value ?? undefined}
        />
    )
}
