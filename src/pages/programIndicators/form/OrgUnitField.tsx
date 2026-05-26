import i18n from '@dhis2/d2-i18n'
import { Box, Field } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useRef } from 'react'
import { useField, useFormState } from 'react-final-form'
import { Option, SearchableSingleSelect } from '../../../components'
import { useBoundResourceQueryFn } from '../../../lib/query/useBoundQueryFn'
import { DisplayableModel } from '../../../types/models'

const PROGRAM_TYPE_WITH_REGISTRATION = 'WITH_REGISTRATION'
const PROGRAM_TYPE_WITHOUT_REGISTRATION = 'WITHOUT_REGISTRATION'
const ANALYTICS_TYPE_EVENT = 'EVENT'
const ANALYTICS_TYPE_ENROLLMENT = 'ENROLLMENT'
const ORG_UNIT_VALUE_TYPE = 'ORGANISATION_UNIT'

export const staticOptions = {
    eventDefault: {
        value: '',
        label: i18n.t('Event organisation unit default'),
    },
    enrollmentDefault: {
        value: ANALYTICS_TYPE_ENROLLMENT,
        label: i18n.t('Enrollment organisation unit default'),
    },
    enrollment: {
        value: ANALYTICS_TYPE_ENROLLMENT,
        label: i18n.t('Enrollment organisation unit'),
    },
    ownerAtStart: {
        value: 'OWNER_AT_START',
        label: i18n.t('Owning organisation unit - start of reporting period'),
    },
    ownerAtEnd: {
        value: 'OWNER_AT_END',
        label: i18n.t('Owning organisation unit - end of reporting period'),
    },
    registration: {
        value: 'REGISTRATION',
        label: i18n.t('Registration organisation unit'),
    },
}

type DisplayableModelAndValueType = DisplayableModel & { valueType: string }

type ProgramStagesType = {
    id: string
    programStages?: {
        id: string
        programStageDataElements: {
            dataElement: DisplayableModelAndValueType
        }[]
    }[]
}

const extractOrgUnitDataElements = (program: ProgramStagesType): Option[] => {
    return (
        program.programStages?.flatMap(({ programStageDataElements }) =>
            programStageDataElements
                .filter(
                    ({ dataElement }) =>
                        dataElement.valueType === ORG_UNIT_VALUE_TYPE
                )
                .map(({ dataElement }) => ({
                    value: dataElement.id,
                    label: dataElement.displayName,
                }))
        ) || []
    )
}

const getProgramAttributes = (program: {
    programTrackedEntityAttributes: {
        trackedEntityAttribute: {
            id: string
            displayName: string
            valueType: string
        }
    }[]
}): Option[] => {
    return (
        program?.programTrackedEntityAttributes?.flatMap(
            ({ trackedEntityAttribute }) =>
                trackedEntityAttribute.valueType === ORG_UNIT_VALUE_TYPE
                    ? [
                          {
                              value: trackedEntityAttribute.id,
                              label: trackedEntityAttribute.displayName,
                          },
                      ]
                    : []
        ) || []
    )
}

const getOptions = ({
    programType,
    analyticsType,
    programAttributesForProgram,
    dataElements,
}: {
    programType: string
    analyticsType: string
    programAttributesForProgram: Option[]
    dataElements: Option[]
}): Option[] => {
    if (programType === PROGRAM_TYPE_WITHOUT_REGISTRATION) {
        return [staticOptions.eventDefault, ...dataElements]
    }

    if (programType === PROGRAM_TYPE_WITH_REGISTRATION) {
        if (analyticsType === ANALYTICS_TYPE_EVENT) {
            return [
                staticOptions.eventDefault,
                ...programAttributesForProgram,
                ...dataElements,
                staticOptions.registration,
                staticOptions.enrollment,
                staticOptions.ownerAtStart,
                staticOptions.ownerAtEnd,
            ]
        }

        if (analyticsType === ANALYTICS_TYPE_ENROLLMENT) {
            return [
                staticOptions.enrollmentDefault,
                ...programAttributesForProgram,
                staticOptions.registration,
                staticOptions.ownerAtStart,
                staticOptions.ownerAtEnd,
            ]
        }
    }

    return []
}

export const OrgUnitField = () => {
    const { input: orgUnitFieldInput, meta: orgUnitFieldMeta } =
        useField('orgUnitField')
    const formValues = useFormState({ subscription: { values: true } }).values
    const queryFn = useBoundResourceQueryFn()
    const previousOptionsRef = useRef<Option[]>([])

    const program = formValues.program
    const programType = program?.programType
    const analyticsType = formValues.analyticsType

    const programAttributesForProgram = useMemo(
        () => getProgramAttributes(program),
        [program]
    )
    const programStagesQuery = useMemo(
        () => ({
            resource: 'programs',
            id: program?.id,
            params: {
                fields: [
                    'programStages[id,programStageDataElements[dataElement[id,displayName,valueType]]]',
                ],
            },
        }),
        [program?.id]
    )

    const { data, error, isLoading, refetch } = useQuery({
        queryKey: [programStagesQuery],
        queryFn: queryFn<ProgramStagesType>,
    })

    const options = useMemo(() => {
        if (!data) {
            return []
        }
        const dataElements = extractOrgUnitDataElements(data)
        return getOptions({
            programType,
            analyticsType,
            programAttributesForProgram,
            dataElements,
        })
    }, [data, programType, analyticsType, programAttributesForProgram])

    const {
        value: orgUnitFieldInputValue,
        onChange: orgUnitFieldInputOnChange,
    } = orgUnitFieldInput

    useEffect(() => {
        const prev = previousOptionsRef.current

        const optionsChanged =
            prev.length !== options.length ||
            prev.some((opt, i) => opt.value !== options[i]?.value)
        const isValueInOptions = options
            .map((o) => o.value)
            .includes(orgUnitFieldInputValue)

        if (optionsChanged && options.length > 0) {
            orgUnitFieldInputOnChange(
                isValueInOptions
                    ? orgUnitFieldInputValue
                    : staticOptions.eventDefault.value
            )
        }

        previousOptionsRef.current = options
    }, [options, orgUnitFieldInputValue, orgUnitFieldInputOnChange])

    const showField = useMemo(() => {
        if (!programType) {
            return false
        }
        if (programType === PROGRAM_TYPE_WITHOUT_REGISTRATION) {
            return true
        }
        if (programType === PROGRAM_TYPE_WITH_REGISTRATION && analyticsType) {
            return true
        }
        return false
    }, [programType, analyticsType])

    return showField ? (
        <Field
            name="orgUnitField"
            label={i18n.t('Organisation unit field')}
            error={!!error || orgUnitFieldMeta.invalid}
            validationText={
                (!!error && i18n.t('Something went wrong')) ||
                (orgUnitFieldMeta.touched &&
                    orgUnitFieldMeta.error?.toString()) ||
                ''
            }
        >
            <Box width="400px" minWidth="100px">
                <SearchableSingleSelect
                    dataTest="org-unit-field"
                    selected={orgUnitFieldInput.value}
                    options={options}
                    onChange={({ selected }) =>
                        orgUnitFieldInput.onChange(selected)
                    }
                    loading={isLoading}
                    showEndLoader={false}
                    onRetryClick={refetch}
                    placeholder={
                        programType === PROGRAM_TYPE_WITHOUT_REGISTRATION ||
                        analyticsType === ANALYTICS_TYPE_EVENT
                            ? staticOptions.eventDefault.label
                            : undefined
                    }
                />
            </Box>
        </Field>
    ) : (
        <></>
    )
}
