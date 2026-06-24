import i18n from '@dhis2/d2-i18n'
import React, { useCallback, useMemo } from 'react'
import { useField, useForm } from 'react-final-form'
import { StandardFormField } from '../../../components'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { required, SECTIONS_MAP } from '../../../lib'
import type { TrackedEntityType } from '../../../types/generated'
import { ConstraintValue, RelationshipSideFieldsProps } from './types'

export const TrackedEntityTypeField = ({
    prefix,
}: RelationshipSideFieldsProps) => {
    const trackedEntityTypeName = `${prefix}Constraint.trackedEntityType`
    const constraintFieldName = `${prefix}Constraint.relationshipEntity`
    const {
        input: { value: constraint },
    } = useField<ConstraintValue | undefined>(constraintFieldName, {
        subscription: { value: true },
    })

    const form = useForm()
    const visible = constraint === 'TRACKED_ENTITY_INSTANCE'

    const trackedEntityTypeQuery = useMemo(() => {
        if (!visible) {
            return null
        }
        return {
            resource: 'trackedEntityTypes',
            params: {
                fields: [
                    'id',
                    'displayName',
                    'name',
                    'trackedEntityTypeAttributes[trackedEntityAttribute[id,displayName]]',
                ],
                order: 'displayName:iasc',
                paging: false,
            },
        }
    }, [visible])

    const clearDependentFields = useCallback(() => {
        const programPath = `${prefix}Constraint.program`
        const programStagePath = `${prefix}Constraint.programStage`
        const trackerDataViewPath = `${prefix}Constraint.trackerDataView`
        form.batch(() => {
            form.change(programPath, undefined)
            form.change(programStagePath, undefined)
            form.change(trackerDataViewPath, {
                attributes: [],
                dataElements: [],
            })
        })
    }, [form, prefix])

    if (!visible || !trackedEntityTypeQuery) {
        return null
    }

    return (
        <StandardFormField>
            <ModelSingleSelectRefreshableFormField<TrackedEntityType>
                name={trackedEntityTypeName}
                label={i18n.t('Tracked entity type')}
                query={trackedEntityTypeQuery}
                required
                validate={required}
                inputWidth="400px"
                onChange={clearDependentFields}
                dataTest={`${prefix}-tracked-entity-type-selector`}
                section={SECTIONS_MAP.trackedEntityType}
            />
        </StandardFormField>
    )
}
