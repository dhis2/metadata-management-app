import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import {
    DefaultIdentifiableFields,
    DescriptionField,
    ModelTransferField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import styles from './OptionGroupFormFields.module.css'
import { OptionSetField } from './OptionSetField'

export const OptionGroupFormFields = ({
    isEdit = false,
}: {
    isEdit?: boolean
}) => {
    const { input: optionSetField } = useField<{ id: string } | null>(
        'optionSet'
    )
    const optionSetId = optionSetField?.value?.id

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this option group.'
                    )}
                </StandardFormSectionDescription>

                <DefaultIdentifiableFields />

                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Options')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the options to include in this option group.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <OptionSetField isEdit={isEdit} />
                </StandardFormField>
                {optionSetId ? (
                    <StandardFormField>
                        <ModelTransferField
                            key={optionSetId}
                            dataTest="options-field"
                            name="options"
                            query={{
                                resource: 'options',
                                params: {
                                    filter: [`optionSet.id:eq:${optionSetId}`],
                                    fields: 'id,displayName',
                                },
                            }}
                            leftHeader={i18n.t('Available options')}
                            rightHeader={i18n.t('Selected options')}
                            filterPlaceholder={i18n.t(
                                'Filter available options'
                            )}
                            filterPlaceholderPicked={i18n.t(
                                'Filter selected options'
                            )}
                            maxSelections={Infinity}
                            leftFooter={<></>}
                        />
                    </StandardFormField>
                ) : (
                    <NoticeBox className={styles.noOptionSetWarning}>
                        {i18n.t(
                            'Choose an option set to start adding options.'
                        )}
                    </NoticeBox>
                )}
            </StandardFormSection>
        </>
    )
}
