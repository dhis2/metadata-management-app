import { Field, TransferProps } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelTransfer, ModelTransferFrom } from '../../../components'
import { PlainResourceQuery } from '../../../types'
import { DisplayableModel } from '../../../types/models'
import { ModelSection } from '../../../types/section'
import css from './ModelTransfer.module.css'

// this currently does not need a generic, because the value of the field is not passed
// or available from props. However if it's made available,
// the generic of <TModel extends DisplayableModel> should be added.
type ModelTransferFieldProps = {
    name: string
    query: PlainResourceQuery
    label?: string
    filterUnassignedTo?: string
    transferSection?: ModelSection
} & Pick<
    TransferProps,
    | 'rightHeader'
    | 'leftHeader'
    | 'rightFooter'
    | 'leftFooter'
    | 'filterPlaceholder'
    | 'filterPlaceholderPicked'
    | 'maxSelections'
    | 'enableOrderChange'
    | 'hideFilterInputPicked'
    | 'dataTest'
    | 'disabled'
    | 'optionsWidth'
    | 'selectedWidth'
    | 'height'
>

export function ModelTransferField({
    name,
    query,
    label,
    leftHeader,
    rightHeader,
    leftFooter,
    rightFooter,
    filterPlaceholder,
    filterPlaceholderPicked,
    maxSelections,
    enableOrderChange,
    dataTest,
    filterUnassignedTo,
    transferSection,
    hideFilterInputPicked = false,
    disabled = false,
    optionsWidth,
    selectedWidth,
    height,
}: ModelTransferFieldProps) {
    const { input, meta } = useField<DisplayableModel[]>(name, {
        multiple: true,
        validateFields: [],
    })

    const sharedProps = {
        selected: input.value || [],
        onChange: ({ selected }: { selected: DisplayableModel[] }) => {
            input.onChange(selected)
            input.onBlur()
        },
        leftFooter,
        rightFooter,
        query,
        maxSelections: maxSelections || 5000,
        enableOrderChange,
        dataTest,
        hideFilterInputPicked,
        disabled,
        filterUnassignedTo,
        optionsWidth,
        selectedWidth,
        height,
    }

    return (
        <Field
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
            name={name}
            label={label}
            className={css.moduleTransferField}
        >
            {transferSection ? (
                <ModelTransferFrom
                    {...sharedProps}
                    transferSection={transferSection}
                />
            ) : (
                <ModelTransfer
                    {...sharedProps}
                    leftHeader={leftHeader}
                    rightHeader={rightHeader}
                    filterPlaceholder={filterPlaceholder}
                    filterPlaceholderPicked={filterPlaceholderPicked}
                />
            )}
        </Field>
    )
}
