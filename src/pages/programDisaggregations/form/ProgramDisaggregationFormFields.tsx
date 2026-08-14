import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    SectionedFormSection,
    SectionedFormSections,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
} from '../../../components'
import { useSyncSelectedSectionWithScroll } from '../../../lib'
import { ProgramIndicatorWithMapping } from '../Edit'
import { CategoryMappingSection } from './CategoryMappingSection'
import { ProgramIndicatorMappingSection } from './ProgramIndicatorMappingSection'

export const ProgramDisaggregationFormFields = ({
    initialProgramIndicators,
    programName,
    programType,
}: {
    initialProgramIndicators: ProgramIndicatorWithMapping[]
    programName?: string
    programType?: string
}) => {
    useSyncSelectedSectionWithScroll()

    return (
        <div>
            <SectionedFormSections>
                <ProgramIndicatorMappingSection
                    initialProgramIndicators={initialProgramIndicators}
                    programName={programName}
                />
                <SectionedFormSection name="disaggregationCategories">
                    <StandardFormSectionTitle>
                        {i18n.t('Disaggregation category mappings')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Define expressions to map individual data to category options.'
                        )}
                    </StandardFormSectionDescription>
                    <CategoryMappingSection
                        dataDimensionType={'DISAGGREGATION'}
                        programType={programType}
                    />
                </SectionedFormSection>
                <SectionedFormSection name="attributeCategories">
                    <StandardFormSectionTitle>
                        {i18n.t('Attribute category mappings')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Define expressions to map individual data to category options.'
                        )}
                    </StandardFormSectionDescription>
                    <CategoryMappingSection
                        dataDimensionType={'ATTRIBUTE'}
                        programType={programType}
                    />
                </SectionedFormSection>
            </SectionedFormSections>
        </div>
    )
}
