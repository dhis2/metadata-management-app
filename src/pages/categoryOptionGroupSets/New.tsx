import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import CategoryOptionGroupSetFormFields from './form/CategoryOptionGroupSetFormFields'
import { initialValues, validate } from './form/categoryOptionGroupSetSchema'

const section = SECTIONS_MAP.categoryOptionGroupSet

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
                <CategoryOptionGroupSetFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
