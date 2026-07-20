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
import { DataApprovalMergeStrategyField } from './DataApprovalMergeStrategyField'
import { DataValueMergeStrategyField } from './DataValueMergeStrategyField'

export const OrganisationUnitMergeFormFields = ({
    selectedIds,
}: {
    selectedIds: string[]
}) => {
    return (
        <FormSections>
            <FormSection>
                <Description>
                    <p>
                        {i18n.t(`The merge operation will merge the source organisation units into
                the target organisation unit. One or many source organisation units
                can be specified`)}
                    </p>
                    <p>
                        {i18n.t(`Only one target should be specified. The merge operation will
                transfer all of the organisation unit metadata associations to the
                source organisation units over to the target organisation unit.`)}
                    </p>
                </Description>
                <MergeSourcesTargetWrapper>
                    <BaseSourcesField
                        label={i18n.t(
                            'Organisation units to be merged (source)'
                        )}
                        placeholder={i18n.t(
                            'Select organisation units to merge'
                        )}
                        query={{
                            resource: 'organisationUnits',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                    />
                    <BaseTargetField
                        label={i18n.t(
                            'Organisation unit to merge into (target)'
                        )}
                        placeholder={i18n.t(
                            'Select organisation unit to merge into'
                        )}
                        query={{
                            resource: 'organisationUnits',
                            params: {
                                fields: ['id', 'displayName', 'name'],
                                filter: `id:in:[${selectedIds.join(',')}]`,
                            },
                        }}
                        noMatchWithoutFilterText={i18n.t(
                            'No organisation units available. Remove one from source.'
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
                        'What should happen to the source organisation units after the merge is complete?'
                    )}
                    getKeepLabel={(count) =>
                        i18n.t('Keep {{ count }} source organisation units', {
                            count,
                        })
                    }
                    getDeleteLabel={(count) =>
                        i18n.t('Delete {{ count }} source organisation units', {
                            count,
                        })
                    }
                />
                <DataValueMergeStrategyField
                    label={i18n.t(
                        'What should happen to the data values recorded for the source organisation units?'
                    )}
                    helpText={i18n.t(
                        'Where source and target have the same data value, the most recently updated is kept.'
                    )}
                />
                <DataApprovalMergeStrategyField
                    label={i18n.t(
                        'What should happen to the data approvals for the source organisation units?'
                    )}
                    helpText={i18n.t(
                        'Where source and target have the same data approval, the most recently updated is kept.'
                    )}
                />
            </FormSection>
            <FormSection>
                <ConfirmationField />
            </FormSection>
        </FormSections>
    )
}
