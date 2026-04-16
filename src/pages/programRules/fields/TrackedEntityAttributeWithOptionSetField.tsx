import { Box, Field as UIField } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import { useDebouncedCallback } from 'use-debounce'
import { BaseModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/BaseModelSingleSelect'
import { useBoundResourceQueryFn, useClearFormFields } from '../../../lib'

type TEAWithOptionSet = {
    id: string
    displayName?: string
    optionSet?: { id: string }
}

const PROGRAM_TEAS_OPTION_SET_QUERY = (programId: string) => ({
    resource: 'programs' as const,
    id: programId,
    params: {
        fields: [
            'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName,optionSet[id]]]',
        ],
        paging: false,
    },
})

export function TrackedEntityAttributeWithOptionSetField({
    programId,
    label,
}: Readonly<{
    programId: string
    label: string
}>) {
    const form = useForm()
    const clearDependentFields = useClearFormFields(
        form,
        'dataElement',
        'option',
        'optionGroup'
    )
    const [filter, setFilter] = useState<string | undefined>(undefined)

    const { values } = useFormState({ subscription: { values: true } })
    const queryFn = useBoundResourceQueryFn()

    const query = useMemo(
        () => PROGRAM_TEAS_OPTION_SET_QUERY(programId),
        [programId]
    )
    const queryResult = useQuery({
        queryKey: [query],
        queryFn: queryFn<{
            programTrackedEntityAttributes?: Array<{
                trackedEntityAttribute: TEAWithOptionSet
            }>
        }>,
    })
    const { data } = queryResult

    const available = useMemo(() => {
        const list =
            data?.programTrackedEntityAttributes?.map(
                (pta) => pta.trackedEntityAttribute
            ) ?? []
        const withOptionSet = list.filter((a) => a.optionSet?.id)
        const allOptions = [
            ...new Map(withOptionSet.map((a) => [a.id, a])).values(),
        ]
        return filter
            ? allOptions.filter((o) =>
                  o.displayName?.toLowerCase().includes(filter.toLowerCase())
              )
            : allOptions
    }, [data, filter])

    const disabled = !!values.dataElement?.id

    const handleFilterChange = useDebouncedCallback(({ value }) => {
        if (value != undefined) {
            setFilter(value)
        }
    }, 250)

    return (
        <Field
            name="trackedEntityAttribute"
            format={(value: TEAWithOptionSet | undefined) => value ?? undefined}
            parse={(value: TEAWithOptionSet | undefined) => value}
        >
            {({ input, meta }) => (
                <UIField
                    label={label}
                    disabled={disabled}
                    error={meta.invalid}
                    validationText={
                        (meta.touched && meta.error?.toString()) || ''
                    }
                >
                    <Box width="400px" minWidth="100px">
                        <BaseModelSingleSelect
                            selected={input.value}
                            available={available}
                            onChange={(value) => {
                                if (value) {
                                    clearDependentFields()
                                }
                                input.onChange(value)
                                input.onBlur()
                            }}
                            disabled={disabled}
                            invalid={meta.touched && !!meta.error}
                            onRetryClick={queryResult.refetch}
                            showEndLoader={false}
                            loading={queryResult.isLoading}
                            clearable
                            onFilterChange={handleFilterChange}
                        />
                    </Box>
                </UIField>
            )}
        </Field>
    )
}
