import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNewWithGroups } from '../../lib'
import { DataElementFormFields, initialValues, validate } from './form'

const section = SECTIONS_MAP.dataElement

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNewWithGroups({
                section,
                groupResource: 'dataElementGroups',
            })}
            initialValues={initialValues}
            validate={validate}
        >
            <DefaultNewFormContents section={section}>
                <DataElementFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
