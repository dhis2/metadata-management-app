import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
} from '../../../components'
import { IconFileField } from './IconFileField'

const validateKey = (value?: string) => {
    if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
        return i18n.t(
            'Key may only contain letters, numbers, hyphens (-) and underscores (_)'
        )
    }
}

function IconKeyField() {
    return (
        <Field
            component={InputFieldFF}
            name="key"
            label={i18n.t('Key')}
            helpText={i18n.t('A unique identifier for this icon')}
            inputWidth="400px"
            required
            validate={validateKey}
            validateFields={[]}
        />
    )
}

function getImageSection(
    mode: 'new' | 'edit',
    href: string | undefined
): React.ReactNode {
    if (mode === 'new') {
        return (
            <StandardFormField>
                <IconFileField />
            </StandardFormField>
        )
    }
    if (href) {
        return (
            <StandardFormField>
                <img
                    src={href}
                    alt={i18n.t('Icon preview')}
                    style={{ width: 48, height: 48, display: 'block' }}
                />
            </StandardFormField>
        )
    }
    return null
}

export function IconFormFields({
    mode,
    href,
}: Readonly<{
    mode: 'new' | 'edit'
    href?: string
}>) {
    return (
        <StandardFormSection>
            <StandardFormSectionTitle>
                {i18n.t('Basic information')}
            </StandardFormSectionTitle>
            {getImageSection(mode, href)}
            <StandardFormField>
                {mode === 'new' ? (
                    <IconKeyField />
                ) : (
                    <Field
                        component={InputFieldFF}
                        name="key"
                        label={i18n.t('Key')}
                        inputWidth="400px"
                        required
                        disabled
                        validateFields={[]}
                    />
                )}
            </StandardFormField>
            <StandardFormField>
                <Field
                    component={InputFieldFF}
                    name="description"
                    label={i18n.t('Description')}
                    inputWidth="400px"
                    validateFields={[]}
                />
            </StandardFormField>
            <StandardFormField>
                <Field
                    component={InputFieldFF}
                    name="keywords"
                    label={i18n.t('Keywords')}
                    helpText={i18n.t('Comma-separated list of keywords')}
                    inputWidth="400px"
                    validateFields={[]}
                />
            </StandardFormField>
        </StandardFormSection>
    )
}
