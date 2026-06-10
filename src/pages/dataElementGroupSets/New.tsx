import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { useOnSubmitNew, SECTIONS_MAP } from '../../lib'
import { DataElementGroupSetFormFields, validate, initialValues } from './form'

const section = SECTIONS_MAP.dataElementGroupSet

export const Component = ({
    onSubmitted,
    footer,
    redirectOnSubmitted = true,
}: {
    readonly onSubmitted?: () => void
    readonly footer?: React.ReactNode
    readonly redirectOnSubmitted?: boolean
} = {}) => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({
                section,
                onSubmitted,
                redirectOnSubmitted,
            })}
            initialValues={initialValues}
            validate={validate}
            section={section}
        >
            <DefaultNewFormContents section={section} footer={footer}>
                <DataElementGroupSetFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
