import i18n from '@dhis2/d2-i18n'
import { Box, Field as UIField } from '@dhis2/ui'
import React, { useMemo } from 'react'
import { Field } from 'react-final-form'
import { BaseModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect/BaseModelSingleSelect'

type LocationModel = { id: string; displayName: string }

const LOCATION_OPTIONS: LocationModel[] = [
    { id: 'FEEDBACK', displayName: i18n.t('Feedback widget') },
    { id: 'INDICATORS', displayName: i18n.t('Program indicator widget') },
]

export function LocationField({ required }: Readonly<{ required?: boolean }>) {
    const available = useMemo(() => LOCATION_OPTIONS, [])

    return (
        <Field
            name="location"
            format={(value: string | undefined) =>
                value ? value.toUpperCase() : ''
            }
            parse={(value: string) => (value ? value.toLowerCase() : undefined)}
        >
            {({ input, meta }) => {
                const selected = available.find((o) => o.id === input.value)

                return (
                    <UIField
                        label={i18n.t('Display widget')}
                        required={required}
                        error={meta.invalid}
                        validationText={
                            (meta.touched && meta.error?.toString()) || ''
                        }
                    >
                        <Box width="400px" minWidth="100px">
                            <BaseModelSingleSelect<LocationModel>
                                selected={selected}
                                available={available}
                                onChange={(value) => {
                                    input.onChange(value?.id ?? '')
                                    input.onBlur()
                                }}
                                invalid={meta.touched && !!meta.error}
                                loading={false}
                                showEndLoader={false}
                                onRetryClick={() => {}}
                                searchable={false}
                            />
                        </Box>
                    </UIField>
                )
            }}
        </Field>
    )
}
