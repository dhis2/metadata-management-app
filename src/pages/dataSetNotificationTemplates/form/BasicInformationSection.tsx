import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    CodeField,
    ModelTransferField,
    NameField,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { SchemaSection, SECTIONS_MAP } from '../../../lib'

type BasicInformationSectionProps = {
    section: SchemaSection
}

export const BasicInformationSection: React.FC<
    BasicInformationSectionProps
> = ({ section }) => (
    <>
        <StandardFormField>
            <NameField schemaSection={section} />
        </StandardFormField>
        <StandardFormField>
            <CodeField schemaSection={section} />
        </StandardFormField>
        <StandardFormSectionTitle>
            {i18n.t('Data sets')}
        </StandardFormSectionTitle>
        <StandardFormSectionDescription>
            {i18n.t('Choose which data sets to send this notification for')}
        </StandardFormSectionDescription>
        <StandardFormField>
            <ModelTransferField
                name="dataSets"
                dataTest="formfields-dataSets"
                query={{ resource: 'dataSets' }}
                transferSection={SECTIONS_MAP.dataSet}
                maxSelections={Infinity}
            />
        </StandardFormField>
    </>
)
