import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React, { useCallback, useMemo } from 'react'
import {
    FormProps,
    FormRenderProps,
    Form as ReactFinalForm,
} from 'react-final-form'
import { defaultValueFormatter } from '../../../lib/form/'
import { EnhancedOnSubmit } from '../../../lib/form/useOnSubmit'
import {
    PartialAttributeValue,
    getAllAttributeValues,
    useCustomAttributesQuery,
} from '../../../lib/models/attributes'
import { RemoveIndexSignature, Section } from '../../../types'
import { LoadingSpinner } from '../../loading/LoadingSpinner'
import { FormBaseProvider, useFormBaseContextValue } from './FormBaseContext'

type MaybeModelWithAttributes = Record<string, unknown> & {
    attributeValues?: PartialAttributeValue[]
}

/* Omit doesnt work because the original type FormProps has an index-signature
   eg. [otherProp: string]: any;
   We dont really want this, so remove it  */
type FixedFormProps<TValues> = RemoveIndexSignature<FormProps<TValues>>

type OwnProps<TValues, TFormattedValues = TValues> = {
    initialValues: TValues | undefined
    children: FormProps<TValues>['children']
    section?: Section
    includeAttributes?: boolean
    fetchError?: boolean
    valueFormatter?: (values: NoInfer<TValues>) => TFormattedValues
    onSubmit: EnhancedOnSubmit<TFormattedValues>
}

export type FormBaseProps<TValues, TFormattedValues = TValues> = Omit<
    FixedFormProps<TValues>,
    keyof OwnProps<TValues> | 'render' | 'component'
> &
    OwnProps<TValues, TFormattedValues>

export function FormBase<TInitialValues extends MaybeModelWithAttributes>({
    initialValues,
    onSubmit,
    validate,
    valueFormatter = defaultValueFormatter,
    includeAttributes = true,
    fetchError = false,
    section,
    ...reactFinalFormProps
}: FormBaseProps<TInitialValues>) {
    const customAttributes = useCustomAttributesQuery({
        enabled: includeAttributes,
        section: section,
    })
    const contextValue = useFormBaseContextValue()

    const initialValuesWithAttributes = useMemo(() => {
        if (!includeAttributes || !initialValues) {
            return initialValues
        }
        return {
            ...initialValues,
            attributeValues: getAllAttributeValues(
                initialValues.attributeValues ?? [],
                customAttributes.data ?? []
            ),
        }
    }, [customAttributes.data, initialValues, includeAttributes])

    const ffSubmit: FormProps<TInitialValues>['onSubmit'] = useCallback(
        (values, form) => {
            return onSubmit(valueFormatter(values), form, {
                submitAction: contextValue.submitActionRef.current,
            })
        },
        [onSubmit, valueFormatter, contextValue.submitActionRef]
    )

    if (fetchError) {
        return <NoticeBox error title={i18n.t('Failed to load data')} />
    }

    if (customAttributes.error) {
        return (
            <NoticeBox
                error
                title={i18n.t('Failed to load custom attributes')}
            />
        )
    }

    if (!initialValuesWithAttributes || customAttributes.loading) {
        return <LoadingSpinner centered />
    }

    const { children } = reactFinalFormProps

    // by defualt we wrap children and add form
    // but if it's a function - we let the consumer override it
    const defaultRender =
        typeof children === 'function'
            ? children
            : ({ handleSubmit }: FormRenderProps<TInitialValues>) => (
                  <form onSubmit={handleSubmit}>{children}</form>
              )

    return (
        <FormBaseProvider value={contextValue}>
            <ReactFinalForm<TInitialValues>
                validateOnBlur={true}
                initialValues={initialValuesWithAttributes}
                onSubmit={ffSubmit}
                validate={(values) =>
                    validate ? validate(valueFormatter(values)) : undefined
                }
                {...reactFinalFormProps}
            >
                {defaultRender}
            </ReactFinalForm>
        </FormBaseProvider>
    )
}
