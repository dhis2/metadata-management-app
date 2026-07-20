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

export const CategoryOptionComboMergeFormFields = ({
    selectedIds,
}: {
    selectedIds: string[]
}) => {
    return (
        <FormSections>
            <FormSection>
                <Description>
                    <p>
                        {i18n.t(`The merge operation will merge the source category option combinations into
                the target category option combination. One or many source category option combinations
                can be specified`)}
                    </p>
                    <p>
                        {i18n.t(`Only one target should be specified. The merge operation will
                transfer all of the category option combination metadata associations to the
                source category option combinations over to the target category option combination.`)}
                    </p>
                </Description>
                <MergeSourcesTargetWrapper>
                    <BaseSourcesField
                        label={i18n.t(
                            'Category option combinations to be merged (source)'
                        )}
                        placeholder={i18n.t(
                            'Select category option combinations to merge'
                        )}
                        query={{
                            resource: 'categoryOptionCombos',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                    />
                    <BaseTargetField
                        label={i18n.t(
                            'Category option combination to merge into (target)'
                        )}
                        placeholder={i18n.t(
                            'Select category option combination to merge into'
                        )}
                        query={{
                            resource: 'categoryOptionCombos',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                        noMatchWithoutFilterText={i18n.t(
                            'No category option combinations available. Remove one from source.'
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
                        'What should happen to the source category option combinations after the merge is complete?'
                    )}
                    getKeepLabel={(count) =>
                        i18n.t(
                            'Keep {{ count }} source category option combinations',
                            {
                                count,
                            }
                        )
                    }
                    getDeleteLabel={(count) =>
                        i18n.t(
                            'Delete {{ count }} source category option combinations',
                            {
                                count,
                            }
                        )
                    }
                />
                <DataValueMergeStrategyField
                    label={i18n.t(
                        'What should happen to the data values recorded for the source category option combinations?'
                    )}
                    helpText={i18n.t(
                        'Where source and target have the same data value, the most recently updated is kept.'
                    )}
                    moveToTargetLabel={i18n.t(
                        'Move data values to the target category option combination'
                    )}
                />
            </FormSection>
            <FormSection>
                <ConfirmationField />
            </FormSection>
        </FormSections>
    )
}
