import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNewWithGroups } from '../../lib'
import { DataElementFormFields, initialValues, validate } from './form'

const section = SECTIONS_MAP.dataElement

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
            onSubmit={useOnSubmitNewWithGroups({
                section,
                groupResource: 'dataElementGroups',
                onSubmitted,
                redirectOnSubmitted,
            })}
            initialValues={initialValues}
            validate={validate}
        >
            <DefaultNewFormContents section={section} footer={footer}>
                <DataElementFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
