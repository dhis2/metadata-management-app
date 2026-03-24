import i18n from '@dhis2/d2-i18n'
import React, { useCallback, useMemo } from 'react'
import { useField, useForm } from 'react-final-form'
import { useHref } from 'react-router'
import { StandardFormField, EditableInputWrapper } from '../../../components'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { useRefreshModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/useRefreshSingleSelect'
import { required } from '../../../lib'
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
    const newProgramLink = useHref('/programs/new')
    const refresh = useRefreshModelSingleSelect({ resource: 'programs' })

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

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                inputWidth="330px"
                onRefresh={() => refresh()}
                onAddNew={() => window.open(newProgramLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refresh, newProgramLink]
    )

    if (!visible || !programQuery) {
        return null
    }

    return (
        <StandardFormField>
            <ModelSingleSelectFormField<Program>
                name={programName}
                label={i18n.t('Program')}
                query={programQuery}
                required={isRequired}
                validate={isRequired ? required : undefined}
                inputWidth="330px"
                onChange={clearDependentFields}
                showNoValueOption={!isRequired}
                dataTest={`${prefix}-program-selector`}
                inputWrapper={inputWrapper}
            />
        </StandardFormField>
    )
}
