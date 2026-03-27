import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, NoticeBox } from '@dhis2/ui'
import { FORM_ERROR } from 'final-form'
import React from 'react'
import { Form } from 'react-final-form'
import {
    BaseListModel,
    Schema,
    SchemaName,
    useSchema,
    useSchemaSectionHandleOrThrow,
} from '../../../lib'
import { WebLocale } from '../../../types/generated'
import { LoadingSpinner } from '../../loading/LoadingSpinner'
import TranslatableFields from './TranslatableFields'
import style from './translation.module.css'
import {
    transformFormValues,
    useInitialFieldsAndValues,
    useBaseReferenceValues,
} from './translationFormHooks'

type TranslationValues = Record<string, string>

type Locale = string
export type TranslationFormValues = Record<Locale, TranslationValues>

const orderedTranslatableFields = [
    'name',
    'shortName',
    'formName',
    'description',
    'executionDateLabel',
    'dueDateLabel',
    'enrollmentDateLabel',
    'incidentDateLabel',
    'enrollmentLabel',
    'enrollmentsLabel',
    'programStageLabel',
    'programStagesLabel',
    'eventLabel',
    'eventsLabel',
    'orgUnitLabel',
    'trackedEntityAttributeLabel',
    'relationshipLabel',
    'followUpLabel',
    'noteLabel',
]

const validEventFields: string[] = ['name', 'shortName', 'description']

/**
 * Get the translateable fields for schemaa.
 * Merge with orderedTranslatableFields fields for order and
 * then filter based on the schema. */

export const getTranslateableFieldsForSchema = (
    schema: Schema,
    model: BaseListModel
) =>
    [
        ...new Set([
            ...orderedTranslatableFields,
            ...Object.keys(schema.properties),
        ]),
    ]
        .filter((field) => schema.properties[field]?.translatable)
        .filter((field) =>
            (model as { programType?: string })?.programType !==
            'WITHOUT_REGISTRATION'
                ? true
                : validEventFields.includes(field)
        )
        .map((field) => schema.properties[field]?.fieldName)
        .filter((f) => f !== undefined)

export const TranslationForm = ({
    model,
    selectedLocale,
    onClose,
    schemaName,
}: {
    model: BaseListModel
    selectedLocale?: WebLocale | undefined
    onClose: () => void
    schemaName?: SchemaName
}) => {
    const engine = useDataEngine()
    const section = useSchemaSectionHandleOrThrow()
    const schemaNameOrDefaultSchemaName = schemaName ?? section.name
    const schema = useSchema(schemaNameOrDefaultSchemaName)

    const { show } = useAlert(
        ({ message }) => message,
        ({ isSuccess }) => (isSuccess ? { success: true } : { critical: true })
    )

    const translatableFields = getTranslateableFieldsForSchema(schema, model)

    const { data: baseReferenceValues } = useBaseReferenceValues({
        modelNamePlural: schema.plural,
        modelId: model.id,
        translatableFields,
    })

    const initialFields = useInitialFieldsAndValues({
        modelId: model.id,
        modelNamePlural: schema.plural,
    })

    if (!initialFields || !baseReferenceValues) {
        return <LoadingSpinner />
    }

    const submitForm = async (values: TranslationFormValues) => {
        if (!selectedLocale) {
            return undefined
        }
        const formData = transformFormValues(values)

        try {
            const UPDATE_MUTATION = {
                resource: `${schema.plural}`,
                type: 'update',
                id: `${model.id}/translations`,
                data: {
                    translations: formData,
                },
            } as const

            await engine.mutate(UPDATE_MUTATION)

            show({
                message: i18n.t('Translation updated successfully'),
                isSuccess: true,
            })
            onClose()
        } catch (error) {
            return { [FORM_ERROR]: (error as Error | string).toString() }
        }
    }

    return (
        <Form
            onSubmit={submitForm}
            initialValues={initialFields}
            subscription={{ submitting: true, submitError: true }}
        >
            {({ handleSubmit, submitting, submitError }) => (
                <form onSubmit={handleSubmit}>
                    <TranslatableFields
                        translatableFields={translatableFields}
                        baseReferenceValues={baseReferenceValues}
                        selectedLocale={selectedLocale}
                    />
                    <div className={style.notice}>
                        {submitError && (
                            <NoticeBox error>{submitError}</NoticeBox>
                        )}
                    </div>

                    <ButtonStrip end>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            primary
                            type="submit"
                            disabled={submitting}
                            loading={submitting}
                            onClick={() => handleSubmit()}
                            dataTest="submit-translations-button"
                        >
                            {i18n.t('Save translations')}
                        </Button>
                    </ButtonStrip>
                </form>
            )}
        </Form>
    )
}
