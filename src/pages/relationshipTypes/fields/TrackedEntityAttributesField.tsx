import i18n from '@dhis2/d2-i18n'
import { Field } from '@dhis2/ui'
import React, { useMemo } from 'react'
import { useField } from 'react-final-form'
import { useHref } from 'react-router'
import { StandardFormField } from '../../../components'
import { useRefreshModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/useRefreshSingleSelect'
import { BaseModelTransfer } from '../../../components/metadataFormControls/ModelTransfer/BaseModelTransfer'
import {
    DefaultTransferLeftFooter,
    TransferHeader,
} from '../../../components/metadataFormControls/ModelTransfer/ModelTransfer'
import { uniqueBy } from '../../../lib/utils'
import { Program, TrackedEntityType } from '../../../types/generated'
import { DisplayableModel } from '../../../types/models'
import { ConstraintValue, RelationshipSideFieldsProps } from './types'

export const TrackedEntityAttributesField = ({
    prefix,
}: RelationshipSideFieldsProps) => {
    const constraintFieldName = `${prefix}Constraint.relationshipEntity`
    const trackedEntityTypeFieldName = `${prefix}Constraint.trackedEntityType`
    const programFieldName = `${prefix}Constraint.program`
    const trackerDataViewPath = `${prefix}Constraint.trackerDataView.attributes`

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
    const {
        input: { value: program },
    } = useField<Program | undefined>(programFieldName, {
        subscription: { value: true },
    })

    const newTrackedEntityAttributeLink = useHref(
        '/trackedEntityAttributes/new'
    )
    const refreshTrackedEntityType = useRefreshModelSingleSelect({
        resource: 'trackedEntityTypes',
    })
    const refreshProgram = useRefreshModelSingleSelect({
        resource: 'programs',
    })

    const visible = useMemo(() => {
        if (!constraint || constraint === 'PROGRAM_STAGE_INSTANCE') {
            return false
        }
        return (
            (constraint === 'TRACKED_ENTITY_INSTANCE' &&
                (!!trackedEntityType?.id || !!program?.id)) ||
            (constraint === 'PROGRAM_INSTANCE' && !!program?.id)
        )
    }, [constraint, trackedEntityType?.id, program?.id])

    const availableAttributes = useMemo<DisplayableModel[]>(() => {
        const getAttributes = (
            items?: Array<{ trackedEntityAttribute?: DisplayableModel }>
        ) =>
            items
                ?.map((item) => item.trackedEntityAttribute)
                .filter((attr): attr is DisplayableModel => !!attr) || []

        const tetAttributes = getAttributes(
            trackedEntityType?.trackedEntityTypeAttributes
        )
        const programAttributes = getAttributes(
            program?.programTrackedEntityAttributes
        )

        return uniqueBy(
            [...tetAttributes, ...programAttributes],
            (attr) => attr.id
        ).sort((a, b) => a.displayName.localeCompare(b.displayName))
    }, [
        trackedEntityType?.trackedEntityTypeAttributes,
        program?.programTrackedEntityAttributes,
    ])

    const { input: attributesInput, meta } = useField<
        string[],
        HTMLElement,
        DisplayableModel[]
    >(trackerDataViewPath, {
        format: (value) =>
            Array.isArray(value)
                ? value
                      .map((id) =>
                          availableAttributes.find((attr) => attr.id === id)
                      )
                      .filter((attr): attr is DisplayableModel => !!attr)
                : [],
        parse: (value) =>
            Array.isArray(value) ? value.map((attr) => attr.id) : [],
        multiple: true,
        validateFields: [],
    })

    if (!visible) {
        return null
    }

    return (
        <StandardFormField>
            <Field
                error={meta.invalid}
                validationText={(meta.touched && meta.error?.toString()) || ''}
                name={trackerDataViewPath}
                label={i18n.t(
                    'Choose which tracked entity attributes are shown when viewing the relationship'
                )}
            >
                <BaseModelTransfer<DisplayableModel>
                    available={availableAttributes}
                    selected={attributesInput.value || []}
                    onChange={({ selected }) => {
                        attributesInput.onChange(selected)
                        attributesInput.onBlur()
                    }}
                    leftHeader={
                        <TransferHeader>
                            {i18n.t('Available tracked entity attributes')}
                        </TransferHeader>
                    }
                    rightHeader={
                        <TransferHeader>
                            {i18n.t('Selected tracked entity attributes')}
                        </TransferHeader>
                    }
                    leftFooter={
                        <DefaultTransferLeftFooter
                            onRefreshClick={() => {
                                if (
                                    constraint === 'TRACKED_ENTITY_INSTANCE' &&
                                    trackedEntityType?.id
                                ) {
                                    refreshTrackedEntityType()
                                } else if (
                                    constraint === 'PROGRAM_INSTANCE' &&
                                    program?.id
                                ) {
                                    refreshProgram()
                                }
                            }}
                            newLink={newTrackedEntityAttributeLink}
                        />
                    }
                    filterPlaceholder={i18n.t(
                        'Filter available tracked entity attributes'
                    )}
                    filterPlaceholderPicked={i18n.t(
                        'Filter selected tracked entity attributes'
                    )}
                    filterable
                    filterablePicked
                    enableOrderChange
                    optionsWidth="45%"
                    selectedWidth="45%"
                    maxSelections={Infinity}
                />
            </Field>
        </StandardFormField>
    )
}
