import { Box, Field as UIField } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Field, useFormState } from 'react-final-form'
import { useDebouncedCallback } from 'use-debounce'
import { BaseModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/BaseModelSingleSelect'
import { useBoundResourceQueryFn } from '../../../lib'

type TEAModel = { id: string; displayName?: string }

const PROGRAM_TEAS_QUERY = (programId: string) => ({
    resource: 'programs' as const,
    id: programId,
    params: {
        fields: [
            'programTrackedEntityAttributes[trackedEntityAttribute[id,displayName]]',
        ],
        paging: false,
    },
})

export function TrackedEntityAttributeField({
    programId,
    label,
    required,
    disableIfOtherFieldSet,
}: Readonly<{
    programId: string
    label: string
    required?: boolean
    disableIfOtherFieldSet?: string
}>) {
    const { values } = useFormState({ subscription: { values: true } })
    const [filter, setFilter] = useState<string | undefined>(undefined)

    const queryFn = useBoundResourceQueryFn()

    const query = useMemo(() => PROGRAM_TEAS_QUERY(programId), [programId])
    const queryResult = useQuery({
        queryKey: [query],
        queryFn: queryFn<{
            programTrackedEntityAttributes?: Array<{
                trackedEntityAttribute: TEAModel
            }>
        }>,
    })
    const { data } = queryResult

    const available = useMemo(() => {
        const allOptions =
            data?.programTrackedEntityAttributes?.map(
                (pta) => pta.trackedEntityAttribute
            ) ?? []
        return filter
            ? allOptions.filter((o) =>
                  o.displayName?.toLowerCase().includes(filter.toLowerCase())
              )
            : allOptions
    }, [data, filter])

    const handleFilterChange = useDebouncedCallback(({ value }) => {
        if (value != undefined) {
            setFilter(value)
        }
    }, 250)

    const formValues = values as Record<string, { id?: string } | undefined>
    const disabled = disableIfOtherFieldSet
        ? !!formValues[disableIfOtherFieldSet]?.id
        : false

    return (
        <Field
            name="trackedEntityAttribute"
            format={(value: TEAModel | undefined) => value ?? undefined}
            parse={(value: TEAModel | undefined) => value}
        >
            {({ input, meta }) => (
                <UIField
                    label={label}
                    required={required}
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
                                input.onChange(value)
                                input.onBlur()
                            }}
                            disabled={disabled}
                            invalid={meta.touched && !!meta.error}
                            onRetryClick={queryResult.refetch}
                            showEndLoader={false}
                            loading={queryResult.isLoading}
                            clearable={!required}
                            onFilterChange={handleFilterChange}
                        />
                    </Box>
                </UIField>
            )}
        </Field>
    )
}
