import i18n from '@dhis2/d2-i18n'
import { RadioFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    HorizontalFieldGroup,
    ModelTransferField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

function CategoryOptionGroupFormFields() {
    const section = SECTIONS_MAP.categoryOptionGroup
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this category option group.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields />
                <DescriptionField />
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Category option group usage')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose how this category option group will be used to capture and analyze data.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <HorizontalFieldGroup
                        label={'Type'}
                        required
                        dataTest="formfields-dataDimensionType"
                    >
                        <Field<string | undefined>
                            name="dataDimensionType"
                            component={RadioFieldFF}
                            label={i18n.t('Disaggregation')}
                            type="radio"
                            value={'DISAGGREGATION'}
                        />
                        <Field<string | undefined>
                            name="dataDimensionType"
                            component={RadioFieldFF}
                            label={i18n.t('Attribute')}
                            type="radio"
                            value={'ATTRIBUTE'}
                        />
                    </HorizontalFieldGroup>
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'categoryOptions'}>
                        {i18n.t('Category options')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the options to include in this category option group.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <StandardFormField>
                        <ModelTransferField
                            name="categoryOptions"
                            query={{
                                resource: 'categoryOptions',
                                params: {
                                    filter: ['isDefault:eq:false'],
                                },
                            }}
                            transferSection={SECTIONS_MAP.categoryOption}
                            maxSelections={Infinity}
                        />
                    </StandardFormField>
                </StandardFormField>
                <CustomAttributesSection schemaSection={section} />
            </StandardFormSection>
        </>
    )
}

export default CategoryOptionGroupFormFields
