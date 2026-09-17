import i18n from '@dhis2/d2-i18n'
import { Box, Field } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import { Option, SearchableSingleSelect } from '../../../components'
import { required, useBoundResourceQueryFn } from '../../../lib'
import { ProgramRuleVariableSourceType } from '../../../types/generated'

type Program = {
    programStages?: Array<{
        id: string
        programStageDataElements?: Array<{
            dataElement: {
                id: string
                displayName: string
            }
        }>
    }>
}

export function DataElementField() {
    const { input: programInput } = useField('program')
    const { input: sourceTypeInput } = useField('programRuleVariableSourceType')
    const { input: programStageInput } = useField('programStage')
    const queryFn = useBoundResourceQueryFn()

    const program = programInput.value
    const sourceType = sourceTypeInput.value
    const programStage = programStageInput.value
    const { input: dataElementInput } = useField('dataElement')
    const currentDataElement = dataElementInput.value

    const programQuery = useMemo(
        () => ({
            resource: 'programs',
            id: program?.id ?? '',
            params: {
                fields: [
                    'programStages[id,programStageDataElements[dataElement[id,displayName]]]',
                ],
            },
        }),
        [program?.id]
    )

    const { data: programData } = useQuery({
        queryKey: [programQuery],
        queryFn: queryFn<Program>,
        enabled: !!program?.id,
    })

    const dataElementOptions = useMemo(() => {
        if (!programData?.programStages) {
            return []
        }

        const stages = programData.programStages

        if (
            sourceType ===
                ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE &&
            programStage?.id
        ) {
            const stage = stages.find((s) => s.id === programStage.id)
            return (
                stage?.programStageDataElements?.map(
                    (psde) => psde.dataElement
                ) || []
            )
        }

        return stages.flatMap(
            (stage) =>
                stage.programStageDataElements?.map(
                    (psde) => psde.dataElement
                ) || []
        )
    }, [programData, sourceType, programStage?.id])

    const availableDataElements = useMemo(() => {
        const elementMap = new Map(dataElementOptions.map((de) => [de.id, de]))

        if (currentDataElement?.id && !elementMap.has(currentDataElement.id)) {
            elementMap.set(currentDataElement.id, {
                id: currentDataElement.id,
                displayName:
                    currentDataElement.displayName || currentDataElement.id,
            })
        }

        return Array.from(elementMap.values())
    }, [dataElementOptions, currentDataElement])

    const options = useMemo<Option[]>(
        () =>
            availableDataElements.map((de) => ({
                value: de.id,
                label: de.displayName || de.id,
            })),
        [availableDataElements]
    )

    const [filteredOptions, setFilteredOptions] = useState<Option[]>(options)

    useEffect(() => {
        setFilteredOptions(options)
    }, [options])

    const handleFilterChange = useCallback(
        ({ value }: { value: string }) => {
            setFilteredOptions(
                options.filter((o) =>
                    o.label.toLowerCase().includes(value.toLowerCase())
                )
            )
        },
        [options]
    )

    if (!program?.id) {
        return null
    }

    return (
        <FieldRFF
            name="dataElement"
            validate={required}
            render={({ input, meta }) => (
                <Field
                    dataTest="dataElement-field"
                    error={meta.invalid}
                    validationText={
                        (meta.touched && meta.error?.toString()) || ''
                    }
                    name={input.name}
                    label={i18n.t('Data element')}
                    required
                >
                    <Box width="400px" minWidth="100px">
                        <SearchableSingleSelect
                            options={filteredOptions}
                            selected={input.value?.id}
                            onChange={({ selected }) => {
                                const chosen = availableDataElements.find(
                                    (de) => de.id === selected
                                )
                                input.onChange(chosen)
                                input.onBlur()
                            }}
                            onFilterChange={handleFilterChange}
                            invalid={meta.touched && !!meta.error}
                            loading={!programData}
                            onRetryClick={() => {}}
                            showEndLoader={false}
                        />
                    </Box>
                </Field>
            )}
        />
    )
}
