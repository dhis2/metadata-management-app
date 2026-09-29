import i18n from '@dhis2/d2-i18n'
import { Field } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { ColorAndIconPicker } from '../../ColorAndIconPicker'

export function ColorAndIconField() {
    const { input: colorInput } = useField('style.color', {
        validateFields: [],
    })
    const { input: iconInput } = useField('style.icon', {
        validateFields: [],
    })

    return (
        <Field
            dataTest="formfields-colorandicon"
            label={i18n.t('Visual configuration')}
        >
            <ColorAndIconPicker
                icon={iconInput.value}
                color={colorInput.value}
                onIconPick={({ icon }: { icon: string }) => {
                    iconInput.onChange(icon)
                }}
                onColorPick={({ color }: { color: string }) => {
                    colorInput.onChange(color)
                }}
            />
        </Field>
    )
}
