import { Box, Field as UIField } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import { useDebouncedCallback } from 'use-debounce'
import { BaseModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/BaseModelSingleSelect'
import { useBoundResourceQueryFn, useClearFormFields } from '../../../lib'

type DataElementWithOptionSet = {
    id: string
    displayName?: string
    optionSet?: { id: string }
}

const PROGRAM_DATA_ELEMENTS_OPTION_SET_QUERY = (programId: string) => ({
    resource: 'programs' as const,
    id: programId,
    params: {
        fields: [
            'programStages[programStageDataElements[dataElement[id,displayName,optionSet[id]]]]',
        ],
        paging: false,
    },
})

export function DataElementWithOptionSetField({
    programId,
    label,
}: Readonly<{
    programId: string
    label: string
}>) {
    const form = useForm()
    const [filter, setFilter] = useState<string | undefined>(undefined)
    const clearDependentFields = useClearFormFields(
        form,
        'trackedEntityAttribute',
        'option',
        'optionGroup'
    )
    const { values } = useFormState({ subscription: { values: true } })
    const queryFn = useBoundResourceQueryFn()

    const query = useMemo(
        () => PROGRAM_DATA_ELEMENTS_OPTION_SET_QUERY(programId),
        [programId]
    )
    const queryResult = useQuery({
        queryKey: [query],
        queryFn: queryFn<{
            programStages?: Array<{
                programStageDataElements?: Array<{
                    dataElement: DataElementWithOptionSet
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
        const withOptionSet = list.filter((de) => de.optionSet?.id)
        const allOptions = [
            ...new Map(withOptionSet.map((de) => [de.id, de])).values(),
        ]
        return filter
            ? allOptions.filter((o) =>
                  o.displayName?.toLowerCase().includes(filter.toLowerCase())
              )
            : allOptions
    }, [data, filter])

    const formValues = values as { trackedEntityAttribute?: { id: string } }
    const disabled = !!formValues.trackedEntityAttribute?.id
    const handleFilterChange = useDebouncedCallback(({ value }) => {
        if (value != undefined) {
            setFilter(value)
        }
    }, 250)

    return (
        <Field
            name="dataElement"
            format={(value: DataElementWithOptionSet | undefined) =>
                value ?? undefined
            }
            parse={(value: DataElementWithOptionSet | undefined) => value}
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
                            clearable
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
