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

export function OptionField({
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

    const OPTIONS_QUERY = {
        resource: 'options' as const,
        params: {
            fields: ['id', 'displayName'],
            filter: [`optionSet.id:eq:${optionSetId}`],
            paging: false,
        },
    }

    return (
        <ModelSingleSelectFormField
            label={label}
            required={required}
            disabled={disabled}
            query={OPTIONS_QUERY}
            clearable={!required}
            name={'option'}
            format={(value) => value ?? undefined}
        />
    )
}
