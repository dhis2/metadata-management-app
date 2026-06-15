import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF, InputFieldFF, TextAreaFieldFF } from '@dhis2/ui'
import React, { useMemo } from 'react'
import { FieldRenderProps } from 'react-final-form'
import { ValueType } from '../../../lib'
import { ModelSingleSelectField } from '../../metadataFormControls/ModelSingleSelect'
import { DateFieldFF, DateTimeFieldFF, TimeFieldFF } from '../date'

type CommonFieldProps = {
    label?: string
    required?: boolean
}

type FinalFormFieldProps = Pick<FieldRenderProps<string>, 'input' | 'meta'>

/**
 * A component that renders an underlying Field based on the valueType
 *
 * Note that this is not bound to a form - but it follows the API of ReactFinalForm
 *  eg. using input and meta
 * The output of all fields is a string (eg. onChange) should be a string
 */
export function ValueTypeRenderer(
    props: CommonFieldProps & FinalFormFieldProps & { valueType: ValueType }
) {
    const valueType = props.valueType
    const value = props.input.value

    // ModelSingleSelects needs value to be an object, but the value from field is an id
    // so keep this stable
    const stableIdValue = useMemo(() => {
        return { id: value }
    }, [value])

    if (valueType === 'BOOLEAN' || valueType === 'TRUE_ONLY') {
        return (
            <CheckboxFieldFF
                {...props}
                type="checkbox"
                input={{
                    ...props.input,
                    checked: value === 'true',
                    onChange: (e) => {
                        const falseValue =
                            valueType === 'BOOLEAN' ? 'false' : undefined
                        props.input.onChange(
                            e.target.checked ? 'true' : falseValue
                        )
                    },
                }}
            />
        )
    }

    if (valueType === 'TEXT') {
        return <InputFieldFF {...props} />
    }
    if (valueType === 'LONG_TEXT') {
        return <TextAreaFieldFF {...props} />
    }
    if (valueType === 'NUMBER') {
        return (
            <InputFieldFF
                {...props}
                input={{
                    ...props.input,
                    type: 'number',
                }}
            />
        )
    }
    if (valueType === 'INTEGER') {
        return (
            <InputFieldFF
                {...props}
                input={{
                    ...props.input,
                    type: 'number',
                }}
            />
        )
    }

    if (valueType === 'GEOJSON') {
        return (
            <TextAreaFieldFF
                {...props}
                resize="both"
                helpText={i18n.t('Please enter a GeoJSON value')}
            />
        )
    }

    if (valueType === 'FILE_RESOURCE') {
        return (
            <ModelSingleSelectField
                {...props}
                showNoValueOption
                query={{
                    resource: 'fileResources',
                }}
                input={{
                    ...props.input,
                    value: stableIdValue,
                    onChange: (e) => {
                        props.input.onChange(e?.id)
                    },
                    onBlur: props.input.onBlur,
                }}
            />
        )
    }

    if (valueType === 'ORGANISATION_UNIT') {
        return (
            <ModelSingleSelectField
                {...props}
                showNoValueOption
                query={{
                    resource: 'organisationUnits',
                }}
                input={{
                    ...props.input,
                    value: stableIdValue,
                    onChange: (e) => {
                        props.input.onChange(e?.id)
                    },
                }}
            />
        )
    }

    if (valueType === 'AGE') {
        return (
            <InputFieldFF
                {...props}
                input={{
                    ...props.input,
                    type: 'number',
                    min: '0',
                }}
            />
        )
    }

    if (valueType === 'DATE') {
        return <DateFieldFF {...props} />
    }
    if (valueType === 'DATETIME') {
        return <DateTimeFieldFF {...props} />
    }

    if (valueType === 'TIME') {
        return <TimeFieldFF {...props} />
    }
    // render a regular input field if not overridden above
    return <InputFieldFF {...props} />
}
