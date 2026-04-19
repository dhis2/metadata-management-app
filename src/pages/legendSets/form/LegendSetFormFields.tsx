import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    CustomAttributesSection,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { CodeField } from '../../../components/form/fields/CodeField'
import { NameField } from '../../../components/form/fields/NameField'
import { SECTIONS_MAP } from '../../../lib'
import { LegendsField } from './legends/LegendsField'

const section = SECTIONS_MAP.legendSet

export function LegendSetFormFields() {
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Set up the basic information for this legend.')}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={section} />
                </StandardFormField>

                <StandardFormField>
                    <CodeField schemaSection={section} />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Legend items')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Create legend items to define value ranges and associated colors.'
                    )}
                </StandardFormSectionDescription>
                <LegendsField />
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
