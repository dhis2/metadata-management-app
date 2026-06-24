import i18n from '@dhis2/d2-i18n'
import React, { useCallback, useMemo } from 'react'
import { useField, useForm } from 'react-final-form'
import { StandardFormField } from '../../../components'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { required, SECTIONS_MAP } from '../../../lib'
import { Program, TrackedEntityType } from '../../../types/generated'
import { ConstraintValue, RelationshipSideFieldsProps } from './types'

export const ProgramField = ({ prefix }: RelationshipSideFieldsProps) => {
    const constraintFieldName = `${prefix}Constraint.relationshipEntity`
    const trackedEntityTypeFieldName = `${prefix}Constraint.trackedEntityType`
    const programName = `${prefix}Constraint.program`
    const programStagePath = `${prefix}Constraint.programStage`

    const {
        input: { value: constraint },
    } = useField<ConstraintValue | undefined>(constraintFieldName, {
        subscription: { value: true },
    })
    const {
        input: { value: trackedEntityType },
    } = useField<TrackedEntityType | undefined>(trackedEntityTypeFieldName, {
        subscription: { value: true },
    })

    const form = useForm()
    const visible =
        !!constraint &&
        (constraint === 'PROGRAM_INSTANCE' ||
            constraint === 'PROGRAM_STAGE_INSTANCE' ||
            (constraint === 'TRACKED_ENTITY_INSTANCE' &&
                !!trackedEntityType?.id))

    const isRequired = constraint !== 'TRACKED_ENTITY_INSTANCE'

    const programQuery = useMemo(() => {
        if (!visible) {
            return null
        }

        const isTrackedEntityInstance =
            constraint === 'TRACKED_ENTITY_INSTANCE' && trackedEntityType?.id
        const isProgramInstance = constraint === 'PROGRAM_INSTANCE'
        const isProgramStageInstance = constraint === 'PROGRAM_STAGE_INSTANCE'

        const baseFields = ['id', 'displayName', 'programType']
        const programAttributesField =
            'programTrackedEntityAttributes[id,trackedEntityAttribute[id,displayName,valueType]]'
        const programStagesField = 'programStages[id]'
        const programStagesWithDataElementsField =
            'programStages[id,programStageDataElements[dataElement[id,displayName]]]'

        let fields: string[] = []
        let filters: string[] = []

        if (isTrackedEntityInstance) {
            fields = [
                ...baseFields,
                'trackedEntityType',
                programAttributesField,
                programStagesField,
            ]
            filters = [
                'programType:eq:WITH_REGISTRATION',
                `trackedEntityType.id:eq:${trackedEntityType.id}`,
            ]
        } else if (isProgramInstance) {
            fields = [...baseFields, programAttributesField, programStagesField]
            filters = ['programType:eq:WITH_REGISTRATION']
        } else if (isProgramStageInstance) {
            fields = [...baseFields, programStagesWithDataElementsField]
        } else {
            fields = [...baseFields, 'trackedEntityType']
        }

        return {
            resource: 'programs',
            params: {
                fields,
                order: 'displayName:iasc',
                ...(filters.length > 0 && { filter: filters }),
                paging: false,
            },
        }
    }, [visible, constraint, trackedEntityType?.id])

    const clearDependentFields = useCallback(
        (selectedProgram: Program | undefined) => {
            const trackerDataViewPath = `${prefix}Constraint.trackerDataView`
            if (!selectedProgram) {
                form.batch(() => {
                    form.change(programStagePath, undefined)
                    form.change(trackerDataViewPath, {
                        attributes: [],
                        dataElements: [],
                    })
                })
                return
            }

            const shouldAutoSetProgramStage =
                constraint === 'PROGRAM_STAGE_INSTANCE' &&
                selectedProgram?.programType === 'WITHOUT_REGISTRATION' &&
                selectedProgram?.programStages &&
                Array.isArray(selectedProgram.programStages) &&
                selectedProgram.programStages.length > 0

            const programStageToSet = shouldAutoSetProgramStage
                ? { id: selectedProgram.programStages[0].id }
                : undefined

            form.batch(() => {
                form.change(programStagePath, programStageToSet)
                form.change(trackerDataViewPath, {
                    attributes: [],
                    dataElements: [],
                })
            })
        },
        [form, prefix, programStagePath, constraint]
    )

    if (!visible || !programQuery) {
        return null
    }

    return (
        <StandardFormField>
            <ModelSingleSelectRefreshableFormField<Program>
                name={programName}
                label={i18n.t('Program')}
                query={programQuery}
                required={isRequired}
                validate={isRequired ? required : undefined}
                inputWidth="400px"
                onChange={clearDependentFields}
                showNoValueOption={!isRequired}
                dataTest={`${prefix}-program-selector`}
                section={SECTIONS_MAP.program}
            />
        </StandardFormField>
    )
}
