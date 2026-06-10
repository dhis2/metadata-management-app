import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    NameField,
    CodeField,
    ModelTransferField,
} from '../../../components'
import { useSchemaSectionHandleOrThrow, SECTIONS_MAP } from '../../../lib'

export const ProgramIndicatorGroupsFormFields = () => {
    const schemaSection = useSchemaSectionHandleOrThrow()

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this program indicator group.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>

                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>
            </StandardFormSection>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'programIndicators'}>
                        {i18n.t('Program indicators')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the program indicators to include in this program indicator group.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ModelTransferField
                        name={'programIndicators'}
                        query={{
                            resource: 'programIndicators',
                        }}
                        transferSection={SECTIONS_MAP.programIndicator}
                        dataTest="program-indicators-transfer"
                        maxSelections={Infinity}
                    />
                </StandardFormField>
            </StandardFormSection>
        </>
    )
}
