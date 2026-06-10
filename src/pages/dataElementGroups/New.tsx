import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { DataElementGroupFormFields, initialValues, validate } from './form'

const section = SECTIONS_MAP.dataElementGroup

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
                <DataElementGroupFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
