import i18n from '@dhis2/d2-i18n'
import { Field } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { ColorPicker } from '../../../../components/ColorAndIconPicker/ColorPicker'
import classes from './ColorAndSymbolField.module.css'
import { SymbolPicker } from './SymbolPicker'

export const ColorAndSymbolField = () => {
    const { input: colorInput } = useField('color', {
        validateFields: [],
    })
    const { input: symbolInput } = useField('symbol', {
        validateFields: [],
    })

    const onSymbolPick = ({ symbol }: { symbol: string }) => {
        symbolInput.onChange(symbol)
    }

    const onColorPick = ({ color }: { color: string }) => {
        colorInput.onChange(color)
    }

    return (
        <Field
            dataTest="formfields-colorandsymbol"
            label={i18n.t('Visual configuration')}
        >
            <div
                className={classes.container}
                role="group"
                aria-label={i18n.t('Color and symbol')}
            >
                <ColorPicker
                    color={colorInput.value}
                    onColorPick={onColorPick}
                />
                <SymbolPicker
                    symbol={symbolInput.value}
                    onSymbolPick={onSymbolPick}
                />
            </div>
        </Field>
    )
}
