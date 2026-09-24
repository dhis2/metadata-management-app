import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React, { useEffect } from 'react'
import { Field, useField } from 'react-final-form'
import {
    FeatureTypeField,
    SectionedFormSection,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { ModelSingleSelectRefreshableFormField } from '../../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import {
    DEFAULT_CATEGORYCOMBO_SELECT_OPTION,
    FEATURES,
    SECTIONS_MAP,
    useFeatureAvailable,
} from '../../../../lib'
import { DisplayableModel } from '../../../../types/models'
import styles from './EnrollmentSettingsFormContents.module.css'

const CATEGORY_COMBOS_QUERY = {
    resource: 'categoryCombos',
    params: {
        filter: ['dataDimensionType:eq:ATTRIBUTE'],
        fields: ['id', 'displayName', 'name'],
    },
}

const addDefaultCategoryComboTransform = <TCatCombo extends DisplayableModel>(
    catCombos: TCatCombo[]
) => [DEFAULT_CATEGORYCOMBO_SELECT_OPTION, ...catCombos]

export const EnrollmentSettingsFormContents = React.memo(
    function EnrollmentSettingsFormContents({ name }: { name: string }) {
        const showEnrollmentAOC = useFeatureAvailable(FEATURES.enrollmentAOC)
        const {
            input: displayIncidentDateInput,
            meta: displayIncidentDateMate,
        } = useField('displayIncidentDate', {
            type: 'checkbox',
        })

        const {
            input: selectIncidentDatesInput,
            meta: selectIncidentDatesMeta,
        } = useField('selectIncidentDatesInFuture', {
            type: 'checkbox',
        })

        useEffect(() => {
            if (
                !displayIncidentDateInput.checked &&
                selectIncidentDatesInput.checked
            ) {
                selectIncidentDatesInput.onChange(false)
            }
        }, [displayIncidentDateInput.checked, selectIncidentDatesInput])

        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Enrollment: Settings', { nsSeparator: '~:~' })}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Configure enrollment options for this program.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ModelSingleSelectRefreshableFormField
                        required
                        name="trackedEntityType"
                        label={i18n.t('Tracked entity type')}
                        query={{
                            resource: 'trackedEntityTypes',
                            params: {
                                fields: 'id,displayName,name,trackedEntityTypeAttributes[trackedEntityAttribute[id,displayName,unique,valueType],mandatory,searchable,displayInList]',
                                paging: false,
                            },
                        }}
                        section={SECTIONS_MAP.trackedEntityType}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FeatureTypeField />
                </StandardFormField>

                <StandardFormField>
                    <Field
                        name="onlyEnrollOnce"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t('Limit to one lifetime enrollment')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <Field
                        name="selectEnrollmentDatesInFuture"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t('Allow enrollment dates in the future')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <CheckboxFieldFF
                        input={displayIncidentDateInput}
                        meta={displayIncidentDateMate}
                        label={i18n.t('Collect an incident date')}
                    />
                </StandardFormField>
                {displayIncidentDateInput.checked && (
                    <StandardFormField>
                        <div className={styles.selectIncidentDatesInFuture}>
                            <CheckboxFieldFF
                                input={selectIncidentDatesInput}
                                meta={selectIncidentDatesMeta}
                                disabled={!displayIncidentDateInput.checked}
                                label={i18n.t(
                                    'Allow incident dates in the future'
                                )}
                            />
                        </div>
                    </StandardFormField>
                )}

                <StandardFormField>
                    <Field
                        name="useFirstStageDuringRegistration"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t(
                            'Show first program stage during enrollment'
                        )}
                    />
                </StandardFormField>

                <StandardFormField>
                    <Field
                        name="ignoreOverdueEvents"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t(
                            'Do not create overdue events when automatically creating program stage events'
                        )}
                    />
                </StandardFormField>

                {showEnrollmentAOC && (
                    <StandardFormField>
                        <ModelSingleSelectRefreshableFormField
                            inputWidth={'400px'}
                            name="enrollmentCategoryCombo"
                            dataTest="formfields-enrollmentcategorycombo"
                            label={i18n.t('Enrollment category combination')}
                            query={CATEGORY_COMBOS_QUERY}
                            transform={addDefaultCategoryComboTransform}
                            section={SECTIONS_MAP.categoryCombo}
                        />
                    </StandardFormField>
                )}
            </SectionedFormSection>
        )
    }
)
