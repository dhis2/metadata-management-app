import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { StandardFormSectionTitle } from '../../../components'
import {
    BaseSourcesField,
    BaseTargetField,
    MergeSourcesTargetWrapper,
    DeleteSourcesFields,
    Description,
    FormSection,
    FormSections,
    ConfirmationField,
} from '../../../components/merge'
import { DataValueMergeStrategyField } from '../../../components/merge/DataValueMergeStrategyField'

export const DataElementMergeFormFields = ({
    selectedIds,
}: {
    selectedIds: string[]
}) => {
    return (
        <FormSections>
            <FormSection>
                <Description>
                    <p>
                        {i18n.t(`The merge operation will merge the source data elements into
                the target data element. One or many source data elements
                can be specified`)}
                    </p>
                    <p>
                        {i18n.t(`Only one target should be specified. The merge operation will
                transfer all of the data element metadata associations to the
                source data elements over to the target data element.`)}
                    </p>
                </Description>
                <MergeSourcesTargetWrapper>
                    <BaseSourcesField
                        label={i18n.t('Data elements to be merged (source)')}
                        placeholder={i18n.t('Select data elements to merge')}
                        query={{
                            resource: 'dataElements',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                    />
                    <BaseTargetField
                        label={i18n.t('Data element to merge into (target)')}
                        placeholder={i18n.t(
                            'Select data element to merge into'
                        )}
                        query={{
                            resource: 'dataElements',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                        noMatchWithoutFilterText={i18n.t(
                            'No data elements available. Remove one from source.'
                        )}
                    />
                </MergeSourcesTargetWrapper>
            </FormSection>
            <FormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Merge settings')}
                </StandardFormSectionTitle>

                <DeleteSourcesFields
                    groupLabel={i18n.t(
                        'What should happen to the source data elements after the merge is complete?'
                    )}
                    getKeepLabel={(count) =>
                        i18n.t('Keep {{ count }} source data elements', {
                            count,
                        })
                    }
                    getDeleteLabel={(count) =>
                        i18n.t('Delete {{ count }} source data elements', {
                            count,
                        })
                    }
                />
                <DataValueMergeStrategyField
                    label={i18n.t(
                        'What should happen to the data values recorded for the source data elements?'
                    )}
                    helpText={i18n.t(
                        'Where source and target have the same data value, the most recently updated is kept.'
                    )}
                />
            </FormSection>
            <FormSection>
                <ConfirmationField />
            </FormSection>
        </FormSections>
    )
}
