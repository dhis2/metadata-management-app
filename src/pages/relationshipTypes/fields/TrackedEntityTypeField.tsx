import i18n from '@dhis2/d2-i18n'
import React, { useCallback, useMemo } from 'react'
import { useField, useForm } from 'react-final-form'
import { useHref } from 'react-router'
import { StandardFormField, EditableInputWrapper } from '../../../components'
import { ModelSingleSelectFormField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { useRefreshModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/useRefreshSingleSelect'
import { required } from '../../../lib'
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
    const newTrackedEntityTypeLink = useHref('/trackedEntityTypes/new')
    const refresh = useRefreshModelSingleSelect({
        resource: 'trackedEntityTypes',
    })

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

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                inputWidth="330px"
                onRefresh={() => refresh()}
                onAddNew={() => window.open(newTrackedEntityTypeLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refresh, newTrackedEntityTypeLink]
    )

    if (!visible || !trackedEntityTypeQuery) {
        return null
    }

    return (
        <StandardFormField>
            <ModelSingleSelectFormField<TrackedEntityType>
                name={trackedEntityTypeName}
                label={i18n.t('Tracked entity type')}
                query={trackedEntityTypeQuery}
                required
                validate={required}
                inputWidth="330px"
                onChange={clearDependentFields}
                dataTest={`${prefix}-tracked-entity-type-selector`}
                inputWrapper={inputWrapper}
            />
        </StandardFormField>
    )
}
