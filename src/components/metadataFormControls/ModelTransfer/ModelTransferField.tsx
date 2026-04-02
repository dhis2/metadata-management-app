import { Field, TransferProps } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelTransfer } from '../../../components'
import { PlainResourceQuery } from '../../../types'
import { DisplayableModel } from '../../../types/models'
import css from './ModelTransfer.module.css'

// this currently does not need a generic, because the value of the field is not passed
// or available from props. However if it's made available,
// the generic of <TModel extends DisplayableModel> should be added.
type ModelTransferFieldProps = {
    name: string
    query: PlainResourceQuery
    label?: string
    filterUnassignedTo?: string
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

    return (
        <Field
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
            name={name}
            label={label}
            className={css.moduleTransferField}
        >
            <ModelTransfer
                selected={input.value || []}
                onChange={({ selected }) => {
                    input.onChange(selected)
                    input.onBlur()
                }}
                leftHeader={leftHeader}
                rightHeader={rightHeader}
                leftFooter={leftFooter}
                rightFooter={rightFooter}
                filterPlaceholder={filterPlaceholder}
                filterPlaceholderPicked={filterPlaceholderPicked}
                query={query}
                maxSelections={maxSelections || 5000}
                enableOrderChange={enableOrderChange}
                dataTest={dataTest}
                hideFilterInputPicked={hideFilterInputPicked}
                disabled={disabled}
                filterUnassignedTo={filterUnassignedTo}
                optionsWidth={optionsWidth}
                selectedWidth={selectedWidth}
                height={height}
            />
        </Field>
    )
}
