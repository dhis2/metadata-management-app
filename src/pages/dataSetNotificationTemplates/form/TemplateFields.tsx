import i18n from '@dhis2/d2-i18n'
import { InputFieldFF, TextAreaFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import { SchemaSection } from '../../../lib'
import { useValidator } from '../../../lib/models/useFieldValidators'

type SubjectTemplateFieldProps = Readonly<{
    helpText?: string
    schemaSection: SchemaSection
}>

export function SubjectTemplateField({
    schemaSection,
    helpText,
}: SubjectTemplateFieldProps) {
    const validator = useValidator({
        schemaSection,
        property: 'subjectTemplate',
    })
    const { meta } = useField('subjectTemplate', {
        subscription: { validating: true },
    })

    const helpString =
        helpText ?? i18n.t('Used as the template for the subject field.')

    return (
        <FieldRFF<string | undefined>
            loading={meta.validating}
            component={InputFieldFF}
            dataTest="formfields-subject-template"
            inputWidth="400px"
            label={i18n.t('Subject')}
            name="subjectTemplate"
            helpText={helpString}
            validate={(subjectTemplate?: string) => validator(subjectTemplate)}
            validateFields={[]}
        />
    )
}

type MessageTemplateFieldProps = Readonly<{
    helpText?: string
    schemaSection: SchemaSection
}>

export function MessageTemplateField({
    schemaSection,
    helpText,
}: MessageTemplateFieldProps) {
    const validator = useValidator({
        schemaSection,
        property: 'messageTemplate',
    })
    const { meta } = useField('messageTemplate', {
        subscription: { validating: true },
    })

    const helpString =
        helpText ?? i18n.t('Used as template for the message field.')

    return (
        <FieldRFF<string | undefined>
            loading={meta.validating}
            component={TextAreaFieldFF}
            dataTest="formfields-message-template"
            required
            label={i18n.t('Message')}
            inputWidth="400px"
            name="messageTemplate"
            helpText={helpString}
            validate={(messageTemplate?: string) => validator(messageTemplate)}
        />
    )
}
