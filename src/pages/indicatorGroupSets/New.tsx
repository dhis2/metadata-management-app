import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import IndicatorGroupSetFormFields from './form/IndicatorGroupSetFormFields'
import { initialValues, validate } from './form/indicatorGroupSetSchema'

const section = SECTIONS_MAP.indicatorGroupSet

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
            includeAttributes={false}
        >
            <DefaultNewFormContents section={section} footer={footer}>
                <IndicatorGroupSetFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
