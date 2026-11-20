import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    DescriptionField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    ModelTransferField,
    NameField,
    CodeField,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

export const PredictorGroupFormFields = () => {
    const section = SECTIONS_MAP.predictorGroup

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this predictor group.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <NameField schemaSection={section} />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={section} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </StandardFormSection>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'predictors'}>{i18n.t('Predictors')}</label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the predictors to include in this predictor group.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ModelTransferField
                        name="predictors"
                        query={{
                            resource: 'predictors',
                        }}
                        transferSection={SECTIONS_MAP.predictor}
                        filterUnassignedTo="predictorGroups"
                        maxSelections={Infinity}
                        dataTest="predictors-transfer"
                    />
                </StandardFormField>
            </StandardFormSection>
        </>
    )
}
