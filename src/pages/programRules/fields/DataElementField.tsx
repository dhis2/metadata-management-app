import { Box, Field as UIField } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Field, useFormState } from 'react-final-form'
import { useDebouncedCallback } from 'use-debounce'
import { BaseModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/BaseModelSingleSelect'
import { useBoundResourceQueryFn } from '../../../lib'

type DataElementModel = { id: string; displayName?: string }

const PROGRAM_DATA_ELEMENTS_QUERY = (programId: string) => ({
    resource: 'programs' as const,
    id: programId,
    params: {
        fields: [
            'programStages[programStageDataElements[dataElement[id,displayName]]]',
        ],
        paging: false,
    },
})

export function DataElementField({
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

    const query = useMemo(
        () => PROGRAM_DATA_ELEMENTS_QUERY(programId),
        [programId]
    )
    const queryResult = useQuery({
        queryKey: [query],
        queryFn: queryFn<{
            programStages?: Array<{
                programStageDataElements?: Array<{
                    dataElement: DataElementModel
                }>
            }>
        }>,
    })
    const { data } = queryResult

    const available = useMemo(() => {
        const list =
            data?.programStages?.flatMap(
                (s) =>
                    s.programStageDataElements?.map(
                        (psde) => psde.dataElement
                    ) ?? []
            ) ?? []
        const allOptions = [...new Map(list.map((de) => [de.id, de])).values()]
        return filter
            ? allOptions.filter((o) =>
                  o.displayName?.toLowerCase().includes(filter.toLowerCase())
              )
            : allOptions
    }, [data, filter])

    const disabled = disableIfOtherFieldSet
        ? !!values[disableIfOtherFieldSet]?.id
        : false

    const handleFilterChange = useDebouncedCallback(({ value }) => {
        if (value != undefined) {
            setFilter(value)
        }
    }, 250)

    return (
        <Field
            name="dataElement"
            format={(value: DataElementModel | undefined) => value ?? undefined}
            parse={(value: DataElementModel | undefined) => value}
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
                            clearable
                            onChange={(value) => {
                                input.onChange(value)
                                input.onBlur()
                            }}
                            disabled={disabled}
                            invalid={meta.touched && !!meta.error}
                            onRetryClick={queryResult.refetch}
                            showEndLoader={false}
                            loading={queryResult.isLoading}
                            onFilterChange={handleFilterChange}
                        />
                    </Box>
                </UIField>
            )}
        </Field>
    )
}
