import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { useField, useFormState } from 'react-final-form'
import { useParams } from 'react-router-dom'
import {
    getConstantTranslation,
    Section,
    useGivenShemaOrSchemaSectionHandleOrThrow,
    useSchema,
} from '../../../lib'
import { ConfirmationModalWrapper } from '../../confirmationModal'

const valueTypeHelpText = i18n.t('Choose the kind of data to collect.')

const valueTypeDisabledHelpText = i18n.t(
    'Disabled as the value type must match the value type of the selected option set.'
)

export function ValueTypeField({
    disabled: externallyDisabled = false,
    disabledText,
    section,
    required = false,
}: Readonly<{
    disabled?: boolean
    disabledText?: string
    required?: boolean
    section?: Section
}>) {
    const { values } = useFormState({ subscription: { values: true } })
    const disabled = !!values.optionSet?.id || externallyDisabled
    const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({ section })
    const schema = useSchema(schemaSection.name)

    const isEdit = !!useParams().id

    const { input } = useField('valueType')

    const optionSetHasMultiTextValueType =
        values.valueType === 'MULTI_TEXT' ||
        (values.optionSet?.id && values.optionSet?.valueType === 'MULTI_TEXT')

    const isOptionSetForm = schemaSection.name === 'optionSet'
    const isProgramRuleVariableForm =
        schemaSection.name === 'programRuleVariable'
    const formTypeAllowsMultiTextOptionSelection =
        isOptionSetForm || isProgramRuleVariableForm
    const showMultiTextOption =
        formTypeAllowsMultiTextOptionSelection || optionSetHasMultiTextValueType

    const optionSetValueType = values.optionSet?.valueType

    useEffect(() => {
        // set value type to match selected option set's value type (if value type does not already match)
        if (optionSetValueType && optionSetValueType !== input.value) {
            input.onChange(optionSetValueType)
            input.onBlur()
        }
        // set VALUE_TYPE back to TEXT default if MULTI_TEXT option set is unselected
        // except if form generally allows MULTI_TEXT value type without option set selection
        if (
            !formTypeAllowsMultiTextOptionSelection &&
            !optionSetValueType &&
            input.value === 'MULTI_TEXT'
        ) {
            input.onChange('TEXT')
            input.onBlur()
        }
    }, [optionSetValueType, input, formTypeAllowsMultiTextOptionSelection])

    const options =
        schema.properties.valueType.constants
            ?.map((constant: string) => ({
                value: constant,
                label: getConstantTranslation(constant),
            }))
            .filter(({ value }: { value: string }) => {
                return showMultiTextOption || value !== 'MULTI_TEXT'
            }) || []

    const combinedHelpText = disabled
        ? disabledText ?? valueTypeDisabledHelpText
        : valueTypeHelpText

    const renderComponent = ({
        onChange,
    }: {
        onChange: (event: { selected: string }) => void
    }) => (
        <SingleSelectField
            dataTest="formfields-valueType"
            inputWidth="400px"
            selected={input.value}
            onChange={onChange}
            label={i18n.t('Value type')}
            required={required}
            disabled={disabled}
            helpText={combinedHelpText}
        >
            {options.map((option: { value: string; label: string }) => (
                <SingleSelectOption
                    key={option.value}
                    label={option.label}
                    value={option.value}
                />
            ))}
        </SingleSelectField>
    )

    const handleChange = ({ selected }: { selected: string }) => {
        input.onChange(selected)
        input.onBlur()
    }

    const objectType =
        schemaSection.name === 'programRuleVariable'
            ? i18n.t('variable')
            : schemaSection.title.toLowerCase()

    if (isEdit && !externallyDisabled) {
        return (
            <ConfirmationModalWrapper
                onChange={handleChange}
                renderComponent={renderComponent}
                modalTitle={i18n.t('Change value type?')}
                modalMessage={i18n.t(
                    'If this {{objectType}} already has data, changing its type can make existing values incompatible and affect analytics tables.',
                    { objectType }
                )}
                modalMessageSelectionSpecificConfirmation={(selection) =>
                    i18n.t(
                        'Change value type from {{currentSelection}} to {{newObjectTypeValue}}?',
                        {
                            currentSelection: getConstantTranslation(
                                input.value
                            ),
                            newObjectTypeValue: selection?.selected
                                ? getConstantTranslation(selection.selected)
                                : i18n.t('undefined'),
                        }
                    )
                }
                confirmButtonLabel={(selection) =>
                    i18n.t('Change to {{newValue}}', {
                        newValue: selection?.selected
                            ? getConstantTranslation(selection.selected)
                            : i18n.t('undefined'),
                    })
                }
            />
        )
    }

    return <>{renderComponent({ onChange: handleChange })}</>
}
