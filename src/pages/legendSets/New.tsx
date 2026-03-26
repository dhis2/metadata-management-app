import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP } from '../../lib'
import { LegendSetFormFields } from './form/LegendSetFormFields'
import { initialValues, validate } from './form/legendSetFormSchema'
import { useOnSubmitNewLegendSet } from './form/useOnSubmitLegendSet'

const section = SECTIONS_MAP.legendSet

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNewLegendSet()}
            initialValues={initialValues}
            validate={validate}
        >
            <DefaultNewFormContents section={section}>
                <LegendSetFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
