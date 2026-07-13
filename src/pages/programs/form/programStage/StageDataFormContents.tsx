import i18n from '@dhis2/d2-i18n'
import {
    CheckboxFieldFF,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
} from '@dhis2/ui'
import React, { useCallback } from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import {
    ModelTransferField,
    RenderingOptionsSelect,
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    StandardFormSubsectionTitle,
    useNewItemFormComponent,
} from '../../../../components'
import { DataElement } from '../../../../types/generated'

type ProgramStageDataElementFormValue = {
    id?: string
    dataElement: DataElement
    valueType: string
    optionSet?: { id: string }
    compulsory: boolean
    displayInReports: boolean
    allowFutureDate: boolean
    skipAnalytics: boolean
    skipSynchronization: boolean
    renderType: {
        MOBILE: { type: string }
        DESKTOP: { type: string }
    }
}

const getValueType = (psde: ProgramStageDataElementFormValue): string =>
    psde.valueType ?? psde.dataElement?.valueType

const getOptionSet = (psde: ProgramStageDataElementFormValue): string =>
    psde.optionSet?.id ?? psde.dataElement?.optionSet?.id

const defaultRenderType = {
    MOBILE: { type: 'DEFAULT' },
    DESKTOP: { type: 'DEFAULT' },
}

export const StageDataFormContents = React.memo(function StageDataFormContents({
    name,
    sectionLabel,
    isTrackerProgram = true,
}: {
    name: string
    sectionLabel: string
    isTrackerProgram?: boolean
}) {
    const fieldName = isTrackerProgram
        ? 'programStageDataElements'
        : 'programStages[0].programStageDataElements'
    const { input } = useField<ProgramStageDataElementFormValue[]>(fieldName, {
        multiple: true,
        validateFields: [],
    })

    const loadDataElementForm = useCallback(
        () => import('../../../dataElements/New'),
        []
    )
    const NewItemForm = useNewItemFormComponent(
        isTrackerProgram ? undefined : loadDataElementForm
    )

    const stageHasDateDataElements = input.value.some(
        (psde) => getValueType(psde) === 'DATE'
    )

    return (
        <SectionedFormSection name={name}>
            <StandardFormSectionTitle>{sectionLabel}</StandardFormSectionTitle>
            {isTrackerProgram && (
                <StandardFormSubsectionTitle>
                    {i18n.t('Program stage data', { nsSeparator: '~:~' })}
                </StandardFormSubsectionTitle>
            )}
            <StandardFormSectionDescription>
                {isTrackerProgram
                    ? i18n.t(
                          'Configure data collection for events in this program stage.'
                      )
                    : i18n.t(
                          'Configure data collection for events in this program.'
                      )}
            </StandardFormSectionDescription>
            <ModelTransferField
                name={fieldName}
                selected={input.value.map((psde) => psde.dataElement)}
                onChange={({ selected }) => {
                    const existingDataElementsMap = new Map(
                        input.value.map((psde) => [psde.dataElement.id, psde])
                    )
                    const selectedDataElements = selected.map((de) => {
                        const existing = existingDataElementsMap.get(de.id)
                        if (existing) {
                            return {
                                ...existing,
                                renderType:
                                    existing.renderType || defaultRenderType,
                                optionSet: existing.optionSet,
                            }
                        }
                        const dataElement = de as DataElement
                        return {
                            dataElement: {
                                id: dataElement.id,
                                displayName: dataElement.displayName,
                                optionSet: dataElement.optionSet,
                            },
                            valueType: dataElement.valueType,
                            optionSet: dataElement.optionSet,
                            compulsory: false,
                            displayInReports: false,
                            allowFutureDate: false,
                            skipAnalytics: false,
                            skipSynchronization: false,
                            renderType: defaultRenderType,
                        }
                    })
                    input.onChange(selectedDataElements)
                    input.onBlur()
                }}
                leftHeader={i18n.t('Available data elements')}
                rightHeader={i18n.t('Selected data elements')}
                filterPlaceholder={i18n.t('Filter available data elements')}
                filterPlaceholderPicked={i18n.t(
                    'Filter selected data elements'
                )}
                maxSelections={Infinity}
                enableOrderChange={false}
                NewItemForm={NewItemForm}
                newItemFormHeader={i18n.t('Add new data element')}
                query={{
                    resource: 'dataElements',
                    params: {
                        fields: ['id', 'displayName', 'valueType', 'optionSet'],
                        filter: ['domainType:eq:TRACKER'],
                    },
                }}
            />
            <StandardFormSubsectionTitle>
                {i18n.t('Configure data items')}
            </StandardFormSubsectionTitle>
            <StandardFormSectionDescription>
                {i18n.t(
                    'Data elements can be collected in different ways with different options.'
                )}
            </StandardFormSectionDescription>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCellHead>{i18n.t('Name')}</TableCellHead>
                        <TableCellHead>{i18n.t('Required')}</TableCellHead>
                        {!isTrackerProgram && (
                            <TableCellHead>
                                {i18n.t('Allow provided elsewhere')}
                            </TableCellHead>
                        )}
                        <TableCellHead>
                            {i18n.t('Display in reports')}
                        </TableCellHead>
                        <TableCellHead>
                            {i18n.t('Skip in analytics')}
                        </TableCellHead>
                        <TableCellHead>{i18n.t('Skip sync')}</TableCellHead>
                        {stageHasDateDataElements && (
                            <TableCellHead>
                                {i18n.t('Allow future dates')}
                            </TableCellHead>
                        )}
                        <TableCellHead>
                            {i18n.t('Desktop Display')}
                        </TableCellHead>
                        <TableCellHead>
                            {i18n.t('Mobile Display')}
                        </TableCellHead>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {input.value.map((dataElement, index) => {
                        const dataElementId = dataElement.dataElement.id
                        const isDateType = getValueType(dataElement) === 'DATE'
                        const rowKey = dataElement.id || dataElementId

                        return (
                            <TableRow key={rowKey}>
                                <TableCell>
                                    {dataElement.dataElement.displayName}
                                </TableCell>
                                <TableCell>
                                    <FieldRFF
                                        component={CheckboxFieldFF}
                                        name={`${fieldName}[${index}].compulsory`}
                                        type="checkbox"
                                    />
                                </TableCell>
                                {!isTrackerProgram && (
                                    <TableCell>
                                        <FieldRFF
                                            component={CheckboxFieldFF}
                                            name={`${fieldName}[${index}].allowProvidedElsewhere`}
                                            type="checkbox"
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <FieldRFF
                                        component={CheckboxFieldFF}
                                        name={`${fieldName}[${index}].displayInReports`}
                                        type="checkbox"
                                    />
                                </TableCell>
                                <TableCell>
                                    <FieldRFF
                                        component={CheckboxFieldFF}
                                        name={`${fieldName}[${index}].skipAnalytics`}
                                        type="checkbox"
                                    />
                                </TableCell>
                                <TableCell>
                                    <FieldRFF
                                        component={CheckboxFieldFF}
                                        name={`${fieldName}[${index}].skipSynchronization`}
                                        type="checkbox"
                                    />
                                </TableCell>
                                {stageHasDateDataElements && (
                                    <TableCell>
                                        <FieldRFF
                                            component={CheckboxFieldFF}
                                            name={`${fieldName}[${index}].allowFutureDate`}
                                            type="checkbox"
                                            disabled={!isDateType}
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <RenderingOptionsSelect
                                        fieldName={fieldName}
                                        index={index}
                                        device="DESKTOP"
                                        valueType={getValueType(dataElement)}
                                        required
                                        hasOptionSet={
                                            !!getOptionSet(dataElement)
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    <RenderingOptionsSelect
                                        fieldName={fieldName}
                                        index={index}
                                        device="MOBILE"
                                        valueType={getValueType(dataElement)}
                                        required
                                        hasOptionSet={
                                            !!getOptionSet(dataElement)
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </SectionedFormSection>
    )
})
