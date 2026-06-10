import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQueryClient } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import {
    FormBase,
    StandardFormActions,
    StandardFormSection,
    useFormBase,
} from '../../components'
import classes from '../../components/form/DefaultFormContents.module.css'
import { DefaultFormErrorNotice } from '../../components/form/DefaultFormErrorNotice'
import {
    getSectionPath,
    SECTIONS_MAP,
    useNavigateWithSearchState,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { ModelWithAttributeValues } from '../../lib/form/createJsonPatchOperations'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { LocaleFormFields } from './form/LocaleFormFields'
import { initialValues, validate } from './form/LocaleSchema'

const section = SECTIONS_MAP.locale

const useOnSubmitLocale = (): EnhancedOnSubmit<
    ModelWithAttributeValues & { language?: string; country?: string }
> => {
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )
    const navigate = useNavigateWithSearchState()

    return useMemo(
        () => async (values) => {
            if (!values) {
                console.error('Tried to save new object without any changes', {
                    values,
                })
                saveAlert.show({
                    message: i18n.t('Cannot save empty object'),
                    error: true,
                })
                return
            }

            const { language, country } = values

            try {
                await dataEngine.mutate({
                    resource: 'locales/dbLocales',
                    type: 'create',
                    params: {
                        country,
                        language,
                    },
                    data: {},
                })

                saveAlert.show({
                    message: i18n.t('Created successfully'),
                    success: true,
                })

                queryClient.invalidateQueries({
                    queryKey: [{ resource: section.namePlural }],
                })

                navigate(`/${getSectionPath(section)}`)

                return
            } catch (error) {
                return createFormError(error)
            }
        },
        [dataEngine, queryClient, saveAlert, navigate]
    )
}

export const Component = () => {
    const onSubmit = useOnSubmitLocale()
    const { setSubmitAction } = useFormBase()
    const listPath = `/${getSectionPath(section)}`

    return (
        <FormBase
            initialValues={
                initialValues as typeof initialValues & { id?: string }
            }
            onSubmit={onSubmit}
            validate={validate}
            includeAttributes={false}
            section={section}
        >
            {({ handleSubmit, submitting }) => {
                return (
                    <div className={classes.form}>
                        <LocaleFormFields />
                        <StandardFormSection>
                            <DefaultFormErrorNotice />
                        </StandardFormSection>
                        <StandardFormActions
                            cancelLabel={i18n.t('Exit without saving')}
                            submitLabel={i18n.t('Create {{modelName}} ', {
                                modelName: section.title,
                            })}
                            onSaveClick={undefined}
                            onSubmitClick={() => {
                                setSubmitAction('saveAndExit')
                                handleSubmit()
                            }}
                            submitting={submitting}
                            cancelTo={listPath}
                        />
                    </div>
                )
            }}
        </FormBase>
    )
}
