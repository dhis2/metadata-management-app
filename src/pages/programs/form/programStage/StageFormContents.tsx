import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF, InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field, useFormState } from 'react-final-form'
import {
    ColorAndIconField,
    CustomAttributesSection,
    DescriptionField,
    FeatureTypeField,
    NameField,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    StandardFormSubsectionTitle,
} from '../../../../components'
import {
    FEATURES,
    SCHEMA_SECTIONS,
    useFeatureAvailable,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
    useValidator,
} from '../../../../lib'
import {
    BlockEntryFormField,
    RepeatableField,
    StandardIntervalField,
    NextScheduleDateField,
    ValidationStrategyField,
    AllowGenerateNextVisitField,
    RemindCompletedField,
    PeriodTypeField,
} from './fields'
import { StageCreationAndSchedulingFormContents } from './StageCreationAndSchedulingFormContents'
import { StageDataFormContents } from './StageDataFormContents'
import { stageSchemaSection } from './StageForm'
import { StageFormDescriptor } from './stageFormDescriptor'
import { StageFormFormContents } from './StageFormFormContents'

export const StageFormContents = ({
    isSubsection,
    setSelectedSection,
}: {
    isSubsection: boolean
    setSelectedSection: (name: string) => void
}) => {
    const { values } = useFormState({ subscription: { values: true } })
    const descriptor = useSectionedFormContext<typeof StageFormDescriptor>()
    useSyncSelectedSectionWithScroll(setSelectedSection)
    const showValidationStrategy = useFeatureAvailable(
        FEATURES.validationStrategy
    )
    const showPluralLabels = useFeatureAvailable(
        FEATURES.customTerminologyPlurals
    )

    const executionDateLabelValidator = useValidator({
        schemaSection: stageSchemaSection,
        property: 'executionDateLabel',
    })
    const dueDateLabelValidator = useValidator({
        schemaSection: stageSchemaSection,
        property: 'dueDateLabel',
    })
    const programStageLabelValidator = useValidator({
        schemaSection: stageSchemaSection,
        property: 'programStageLabel',
    })
    const eventLabelValidator = useValidator({
        schemaSection: stageSchemaSection,
        property: 'eventLabel',
    })
    const eventsLabelValidator = useValidator({
        schemaSection: stageSchemaSection,
        property: 'eventsLabel',
    })

    return (
        <div style={{ padding: 'var(--spacers-dp16) 0 0 0' }}>
            <SectionedFormSections>
                <SectionedFormSection
                    name={descriptor.getSection('stageSetup').name}
                >
                    <StandardFormSectionTitle>
                        {i18n.t('Basic information')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Configure the basic information for this program stage.'
                        )}
                    </StandardFormSectionDescription>
                    <NameField schemaSection={SCHEMA_SECTIONS.programStage} />
                    <StandardFormField>
                        <DescriptionField />
                    </StandardFormField>
                    <StandardFormField>
                        <ColorAndIconField />
                    </StandardFormField>
                </SectionedFormSection>
                <SectionedFormSection
                    name={descriptor.getSection('stageConfiguration').name}
                >
                    <StandardFormSectionTitle>
                        {i18n.t('Data entry options')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Set up how data is collected for events in this program stage.'
                        )}
                    </StandardFormSectionDescription>
                    <StandardFormField>
                        <FeatureTypeField />
                    </StandardFormField>
                    <StandardFormField>
                        <Field
                            name="enableUserAssignment"
                            type="checkbox"
                            component={CheckboxFieldFF}
                            label={i18n.t(
                                'Allow events to be assigned to users'
                            )}
                            dataTest="formfields-enableUserAssignment"
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <RepeatableField />
                    </StandardFormField>
                    {values.repeatable && (
                        <div style={{ marginInlineStart: '24px' }}>
                            <StandardFormField>
                                <StandardIntervalField />
                            </StandardFormField>
                            <StandardFormField>
                                <NextScheduleDateField />
                            </StandardFormField>
                        </div>
                    )}

                    <StandardFormField>
                        <PeriodTypeField />
                    </StandardFormField>
                    {showValidationStrategy && (
                        <StandardFormField>
                            <ValidationStrategyField />
                        </StandardFormField>
                    )}
                    <StandardFormField>
                        <Field
                            name="preGenerateUID"
                            type="checkbox"
                            component={CheckboxFieldFF}
                            label={i18n.t('Generate offline event IDs')}
                            dataTest="formfields-preGenerateUID"
                        />
                    </StandardFormField>
                    <StandardFormSubsectionTitle>
                        {i18n.t('Completion options')}
                    </StandardFormSubsectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Decide what should happen after a user completes this event.'
                        )}
                    </StandardFormSectionDescription>

                    <StandardFormField>
                        <AllowGenerateNextVisitField />
                    </StandardFormField>
                    <StandardFormField>
                        <RemindCompletedField />
                    </StandardFormField>
                    <StandardFormField>
                        <BlockEntryFormField />
                    </StandardFormField>
                </SectionedFormSection>
                <StageCreationAndSchedulingFormContents
                    name={
                        descriptor.getSection('stageCreationAndScheduling').name
                    }
                    sectionLabel={
                        descriptor.getSection('stageCreationAndScheduling')
                            .label
                    }
                />
                <StageDataFormContents
                    name={descriptor.getSection('stageData').name}
                    sectionLabel={descriptor.getSection('stageData').label}
                />
                <StageFormFormContents
                    isSubsection={isSubsection}
                    name={descriptor.getSection('stageForm').name}
                    sectionLabel={descriptor.getSection('stageForm').label}
                />
                <SectionedFormSection
                    name={descriptor.getSection('stageTerminology').name}
                >
                    <StandardFormSectionTitle>
                        {i18n.t('Customization')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Override default labels with program stage-specific terms.'
                        )}
                    </StandardFormSectionDescription>
                    <StandardFormField>
                        <Field
                            component={InputFieldFF}
                            name="executionDateLabel"
                            inputWidth="400px"
                            label={i18n.t('Custom label for report date')}
                            dataTest="formfields-executionDateLabel"
                            validate={executionDateLabelValidator}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <Field
                            component={InputFieldFF}
                            name="dueDateLabel"
                            inputWidth="400px"
                            label={i18n.t('Custom label for due date')}
                            dataTest="formfields-dueDateLabel"
                            validate={dueDateLabelValidator}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <Field
                            component={InputFieldFF}
                            name="programStageLabel"
                            inputWidth="400px"
                            label={i18n.t('Custom label for program stage')}
                            dataTest="formfields-programStageLabel"
                            validate={programStageLabelValidator}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <Field
                            component={InputFieldFF}
                            name="eventLabel"
                            inputWidth="400px"
                            label={i18n.t('Custom label for event')}
                            dataTest="formfields-eventLabel"
                            validate={eventLabelValidator}
                        />
                    </StandardFormField>
                    {showPluralLabels && (
                        <StandardFormField>
                            <Field
                                component={InputFieldFF}
                                name="eventsLabel"
                                inputWidth="400px"
                                label={i18n.t(
                                    'Custom label for event (plural)'
                                )}
                                dataTest="formfields-eventsLabel"
                                validate={eventsLabelValidator}
                            />
                        </StandardFormField>
                    )}
                </SectionedFormSection>
                <CustomAttributesSection
                    schemaSection={SCHEMA_SECTIONS.programStage}
                    sectionedLayout
                />
            </SectionedFormSections>
        </div>
    )
}
