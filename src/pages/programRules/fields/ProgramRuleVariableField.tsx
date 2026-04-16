import i18n from '@dhis2/d2-i18n'
import { Box, Field as UIField } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { Field } from 'react-final-form'
import { useDebouncedCallback } from 'use-debounce'
import { BaseModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/BaseModelSingleSelect'
import { useBoundResourceQueryFn } from '../../../lib'

type ProgramRuleVariableModel = {
    id: string
    name: string
    displayName?: string
}

const PROGRAM_RULE_VARIABLES_QUERY = (programId: string) => ({
    resource: 'programRuleVariables' as const,
    params: {
        fields: ['id', 'name', 'displayName'],
        filter: `program.id:eq:${programId}`,
        paging: false,
    },
})

export function ProgramRuleVariableField({
    programId,
}: Readonly<{ programId: string }>) {
    const queryFn = useBoundResourceQueryFn()

    const query = useMemo(
        () => PROGRAM_RULE_VARIABLES_QUERY(programId),
        [programId]
    )
    const [filter, setFilter] = useState<string | undefined>(undefined)

    const queryResult = useQuery({
        queryKey: [query],
        queryFn: queryFn<{
            programRuleVariables?: ProgramRuleVariableModel[]
        }>,
    })
    const { data } = queryResult

    const available = useMemo(() => {
        const allOptions = data?.programRuleVariables ?? []
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

    return (
        <Field name="content">
            {({ input, meta }) => {
                const name = (input.value as string) ?? ''
                const selected = name
                    ? available.find((v) => v.name === name) ??
                      ({
                          id: '',
                          name,
                          displayName: undefined,
                      } as ProgramRuleVariableModel)
                    : undefined

                return (
                    <UIField
                        label={i18n.t('Program rule variable to assign to')}
                        error={meta.invalid}
                        validationText={
                            (meta.touched && meta.error?.toString()) || ''
                        }
                    >
                        <Box width="400px" minWidth="100px">
                            <BaseModelSingleSelect<ProgramRuleVariableModel>
                                selected={selected}
                                available={available}
                                onChange={(value) => {
                                    input.onChange(value?.name ?? '')
                                    input.onBlur()
                                }}
                                clearable
                                invalid={meta.touched && !!meta.error}
                                onRetryClick={queryResult.refetch}
                                showEndLoader={false}
                                loading={queryResult.isLoading}
                                onFilterChange={handleFilterChange}
                            />
                        </Box>
                    </UIField>
                )
            }}
        </Field>
    )
}
