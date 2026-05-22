import i18n from '@dhis2/d2-i18n'
import { FieldGroup, RadioFieldFF, SingleSelectFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field, useField } from 'react-final-form'
import { useParams } from 'react-router-dom'
import {
    StandardFormSection,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    StandardFormField,
    CustomAttributesSection,
    NameField,
    DescriptionField,
} from '../../../components'
import {
    SCHEMA_SECTIONS,
    useSchema,
    getConstantTranslation,
} from '../../../lib'
import { SqlView } from '../../../types/generated'
import { QueryDefinitionField } from './QueryDefinitionField'

const section = SCHEMA_SECTIONS.sqlView

export function SqlViewFormFields() {
    const isEdit = !!useParams().id
    const schema = useSchema(section.name)
    const cacheStrategyOptions =
        schema?.properties.cacheStrategy?.constants?.map((constant) => ({
            value: constant,
            label: getConstantTranslation(constant),
        })) ?? []
    const { input: typeInput } = useField('type')

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t('Set up the basic information for this SQL view.')}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={section} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
                <StandardFormField>
                    <Field
                        required
                        component={SingleSelectFieldFF}
                        inputWidth="400px"
                        name="cacheStrategy"
                        label={i18n.t('Cache strategy')}
                        dataTest="formfields-cacheStrategy"
                        options={cacheStrategyOptions}
                        helpText={i18n.t(
                            'Controls how long results are cached on the server before re-execution'
                        )}
                    />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('SQL definition')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the type of SQL view and define the query.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <FieldGroup
                        label={i18n.t('SQL type')}
                        required
                        dataTest="formfields-type"
                        helpText={
                            isEdit
                                ? i18n.t(
                                      'SQL type cannot be changed after creation.'
                                  )
                                : undefined
                        }
                    >
                        <Field<string | undefined>
                            name="type"
                            component={RadioFieldFF}
                            label={i18n.t(
                                'View: SQL query is stored in the database; results are generated each time.',
                                { nsSeparator: '~:~' }
                            )}
                            type="radio"
                            value={SqlView.type.VIEW}
                            disabled={isEdit}
                        />
                        <Field<string | undefined>
                            name="type"
                            component={RadioFieldFF}
                            label={i18n.t(
                                'Materialized view: SQL query is stored, and results are cached.',
                                { nsSeparator: '~:~' }
                            )}
                            type="radio"
                            value={SqlView.type.MATERIALIZED_VIEW}
                            disabled={isEdit}
                        />
                        <Field<string | undefined>
                            name="type"
                            component={RadioFieldFF}
                            label={i18n.t(
                                'Query only: Neither query nor results stored in the database. Supports inline $(variable) references.',
                                { nsSeparator: '~:~' }
                            )}
                            type="radio"
                            value={SqlView.type.QUERY}
                            disabled={isEdit}
                        />
                    </FieldGroup>
                </StandardFormField>
                <StandardFormField>
                    <QueryDefinitionField
                        isQuery={typeInput.value === SqlView.type.QUERY}
                    />
                </StandardFormField>
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
