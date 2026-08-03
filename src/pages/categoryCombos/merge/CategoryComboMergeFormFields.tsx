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

export const CategoryComboMergeFormFields = ({
    selectedIds,
    hideConfirmation = false,
}: {
    selectedIds: string[]
    hideConfirmation?: boolean
}) => {
    return (
        <FormSections>
            <FormSection>
                <Description>
                    <p>
                        {i18n.t(`The merge operation will merge the source category combinations into
                the target category combination. One or many source category combinations
                can be specified`)}
                    </p>
                    <p>
                        {i18n.t(`Only one target should be specified. The merge operation will
                transfer all of the category combinations metadata associations to the
                source category combinations over to the target category combination.`)}
                    </p>
                </Description>
                <MergeSourcesTargetWrapper>
                    <BaseSourcesField
                        label={i18n.t(
                            'Category combinations to be merged (source)'
                        )}
                        placeholder={i18n.t(
                            'Select category combinations to merge'
                        )}
                        query={{
                            resource: 'categoryCombos',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                    />
                    <BaseTargetField
                        label={i18n.t(
                            'Category combination to merge into (target)'
                        )}
                        placeholder={i18n.t(
                            'Select category combination to merge into'
                        )}
                        query={{
                            resource: 'categoryCombos',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                        noMatchWithoutFilterText={i18n.t(
                            'No category combinations available. Remove one from source.'
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
                        'What should happen to the source category combinations after the merge is complete?'
                    )}
                    getKeepLabel={(count) =>
                        i18n.t(
                            'Keep {{ count }} source category combinations',
                            {
                                count,
                            }
                        )
                    }
                    getDeleteLabel={(count) =>
                        i18n.t(
                            'Delete {{ count }} source category combinations',
                            {
                                count,
                            }
                        )
                    }
                />
            </FormSection>
            <FormSection>
                {!hideConfirmation && <ConfirmationField />}
            </FormSection>
        </FormSections>
    )
}
