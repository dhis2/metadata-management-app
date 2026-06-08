import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNewWithGroups } from '../../lib'
import { validate } from './form'
import { CategoryOptionFormFields } from './form/CategoryOptionFormFields'
import { initialValues, transformFormValues } from './form/categoryOptionSchema'

const section = SECTIONS_MAP.categoryOption

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
                groupResource: 'categoryOptionGroups',
                onSubmitted,
                redirectOnSubmitted,
            })}
            initialValues={initialValues}
            validate={validate}
            valueFormatter={transformFormValues}
            section={section}
        >
            <DefaultNewFormContents section={section} footer={footer}>
                <CategoryOptionFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
