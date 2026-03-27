import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    SectionedFormSection,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { ValidationStrategyField } from '../programStage/fields'

export const ProgramSettingsFormContents = React.memo(
    function ProgramSettingsFormContents({ name }: { name: string }) {
        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Program Settings')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up how data is collected for events in this program.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <Field
                        name="programStages[0].enableUserAssignment"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t('Allow events to be assigned to users')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <Field
                        name="programStages[0].blockEntryForm"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t('Block data entry after completion')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <Field
                        name="programStages[0].preGenerateUID"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t('Generate offline event IDs')}
                    />
                </StandardFormField>

                <StandardFormField>
                    <ValidationStrategyField isTrackerProgram={false} />
                </StandardFormField>
            </SectionedFormSection>
        )
    }
)
