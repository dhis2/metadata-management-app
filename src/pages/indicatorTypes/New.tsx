import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { validate } from './form'
import { IndicatorTypesFormFields } from './form/IndicatorTypesFormFields'
import { initialValues } from './form/indicatorTypesSchema'

const section = SECTIONS_MAP.indicatorType

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
            initialValues={initialValues}
            onSubmit={useOnSubmitNew({
                section,
                onSubmitted,
                redirectOnSubmitted,
            })}
            validate={validate}
            includeAttributes={false}
            section={section}
        >
            <DefaultNewFormContents section={section} footer={footer}>
                <IndicatorTypesFormFields section={section} />
            </DefaultNewFormContents>
        </FormBase>
    )
}
