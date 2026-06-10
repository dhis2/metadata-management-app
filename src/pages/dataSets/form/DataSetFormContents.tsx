import React from 'react'
import { CustomAttributesSection } from '../../../components'
import { SectionedFormSections } from '../../../components/sectionedForm'
import {
    Section,
    SECTIONS_MAP,
    useSectionedFormContext,
    useSyncSelectedSectionWithScroll,
} from '../../../lib'
import { AdvancedFormContents } from './AdvancedFormContents'
import { DataEntryFromContents } from './dataEntryForm'
import { DataFormContents } from './DataFormContents'
import { DataSetFormDescriptor } from './formDescriptor'
import { OrganisationUnitsFormContents } from './OrganisationUnitsFormContents'
import { PeriodsContents } from './PeriodsFormContents'
import { SetupFormContents } from './SetupFormContents'
import { ValidationFormContents } from './ValidationFormContents'

export const DataSetFormContents = ({ section }: { section?: Section }) => {
    const descriptor = useSectionedFormContext<typeof DataSetFormDescriptor>()
    useSyncSelectedSectionWithScroll()
    return (
        <>
            <SectionedFormSections>
                <SetupFormContents
                    name={descriptor.getSection('setup').name}
                    section={section}
                />
                <DataFormContents name={descriptor.getSection('data').name} />
                <PeriodsContents name={descriptor.getSection('periods').name} />
                <ValidationFormContents
                    name={descriptor.getSection('validation').name}
                />
                <OrganisationUnitsFormContents name={'organisationUnits'} />
                <DataEntryFromContents
                    name={descriptor.getSection('form').name}
                />
                <AdvancedFormContents
                    name={descriptor.getSection('advanced').name}
                />
                <CustomAttributesSection
                    schemaSection={SECTIONS_MAP.dataSet}
                    sectionedLayout
                />
            </SectionedFormSections>
        </>
    )
}
