import i18n from '@dhis2/d2-i18n'
import { Field, InputField } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { getConstantTranslation } from '../../../lib'
import css from './GeometryFields.module.css'

export function GeometryFields() {
    const fieldName = 'geometry'
    const { input, meta } = useField(fieldName)

    const handleChange = ({
        longitude,
        latitude,
    }: {
        longitude?: number
        latitude?: number
    }) => {
        const geometry = {
            type: 'Point',
            coordinates: [longitude ?? undefined, latitude ?? undefined],
        }
        input.onChange(geometry)
        input.onBlur()
    }

    return !input.value || input.value?.type === 'Point' ? (
        <>
            <Field
                className={css.coordinateField}
                name={fieldName}
                error={meta.touched && !!meta.error}
                validationText={
                    meta.touched ? meta.error?.coordinates : undefined
                }
            >
                <InputField
                    onChange={(e) =>
                        handleChange({
                            longitude: e.value
                                ? parseFloat(e.value)
                                : undefined,
                            latitude: input.value?.coordinates?.[1],
                        })
                    }
                    label={i18n.t('Longitude')}
                    inputWidth="400px"
                    name="longitude"
                    type="number"
                    value={input.value.coordinates?.[0]?.toString()}
                    min="-180"
                    max="180"
                    step="any"
                />
                <InputField
                    onChange={(e) =>
                        handleChange({
                            longitude: input.value?.coordinates?.[0],
                            latitude: e.value ? parseFloat(e.value) : undefined,
                        })
                    }
                    inputWidth="400px"
                    label={i18n.t('Latitude')}
                    name="latitude"
                    type="number"
                    value={input.value?.coordinates?.[1]?.toString()}
                    min="-90"
                    max="90"
                    step="any"
                />
            </Field>
        </>
    ) : (
        <InputField
            placeholder={i18n.t('{{type}} coordinates are not editable', {
                type: getConstantTranslation(input.value?.type),
            })}
            inputWidth="400px"
            disabled
        />
    )
}
