import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { LegendSetFormFields } from './form/LegendSetFormFields'
import { initialValues, validate } from './form/legendSetSchema'

const section = SECTIONS_MAP.legendSet

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={initialValues}
            validate={validate}
        >
            <DefaultNewFormContents section={section}>
                <LegendSetFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
