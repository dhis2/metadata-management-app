import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { validate } from './form'
import { CategoryComboFormFields } from './form/CategoryComboFormFields'
import { initialValues } from './form/categoryComboSchema'

const section = SECTIONS_MAP.categoryCombo

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
            includeAttributes={false}
            section={section}
        >
            <DefaultNewFormContents section={section} footer={footer}>
                <CategoryComboFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
