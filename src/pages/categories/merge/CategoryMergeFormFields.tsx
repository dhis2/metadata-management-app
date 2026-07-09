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

export const CategoryMergeFormFields = ({
    selectedIds,
}: {
    selectedIds: string[]
}) => {
    return (
        <FormSections>
            <FormSection>
                <Description>
                    <p>
                        {i18n.t(`The merge operation will merge the source categories into
                the target category. One or many source categories
                can be specified`)}
                    </p>
                    <p>
                        {i18n.t(`Only one target should be specified. The merge operation will
                transfer all of the category metadata associations to the
                source categories over to the target category.`)}
                    </p>
                </Description>
                <MergeSourcesTargetWrapper>
                    <BaseSourcesField
                        label={i18n.t('Categories to be merged (source)')}
                        placeholder={i18n.t('Select categories to merge')}
                        query={{
                            resource: 'categories',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                    />
                    <BaseTargetField
                        label={i18n.t('Category to merge into (target)')}
                        placeholder={i18n.t('Select category to merge into')}
                        query={{
                            resource: 'categories',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                        noMatchWithoutFilterText={i18n.t(
                            'No categories available. Remove one from source.'
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
                        'What should happen to the source categories after the merge is complete?'
                    )}
                    getKeepLabel={(count) =>
                        i18n.t('Keep {{ count }} source categories', {
                            count,
                        })
                    }
                    getDeleteLabel={(count) =>
                        i18n.t('Delete {{ count }} source categories', {
                            count,
                        })
                    }
                />
            </FormSection>
            <FormSection>
                <ConfirmationField />
            </FormSection>
        </FormSections>
    )
}
