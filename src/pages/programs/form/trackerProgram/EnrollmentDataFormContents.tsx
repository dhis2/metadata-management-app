import i18n from '@dhis2/d2-i18n'
import {
    CheckboxFieldFF,
    Field,
    Table,
    TableBody,
    TableCell,
    TableCellHead,
    TableHead,
    TableRow,
    TransferOption,
} from '@dhis2/ui'
import React, { useEffect, useRef } from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import {
    ModelTransferFrom,
    RenderingOptionsSelect,
    SectionedFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import css from '../../../../components/metadataFormControls/ModelTransfer/ModelTransfer.module.css'
import {
    InfoIconWithTooltip,
    TooltipWrapper,
} from '../../../../components/tooltip'
import { SECTIONS_MAP } from '../../../../lib'
import { ProgramTrackedEntityAttribute } from '../../../../types/generated'
import { ProgramsFromFilters } from '../../EditTrackerProgram'

const defaultRenderType = {
    MOBILE: { type: 'DEFAULT' },
    DESKTOP: { type: 'DEFAULT' },
}

export const EnrollmentDataFormContents = React.memo(
    function SetupFormContents({ name }: { name: string }) {
        const { input, meta } = useField<
            (ProgramsFromFilters['programTrackedEntityAttributes'][0] & {
                optionSet?: { id: string }
            })[]
        >('programTrackedEntityAttributes', {
            multiple: true,
            validateFields: [],
        })

        const trackedEntityTypeField = useField<
            ProgramsFromFilters['trackedEntityType']
        >('trackedEntityType', {
            subscription: { value: true },
        })

        const previousTetaIdsRef = useRef<Set<string>>(new Set())

        const tetas =
            trackedEntityTypeField.input.value?.trackedEntityTypeAttributes ||
            []

        const tetaMap = new Map<string, ProgramTrackedEntityAttribute>(
            tetas.map((teta: ProgramTrackedEntityAttribute) => [
                teta.trackedEntityAttribute.id,
                teta,
            ])
        )

        const tetaIds = new Set(tetaMap.keys())

        const tetaIdsString = Array.from(tetaIds).join(',')

        useEffect(() => {
            if (!trackedEntityTypeField.input.value?.id) {
                return
            }

            const existingProgramAttributesMap = new Map(
                input.value.map((programAttribute) => [
                    programAttribute.trackedEntityAttribute.id,
                    programAttribute,
                ])
            )

            const convertedTetas = tetas.map(
                (teta: ProgramTrackedEntityAttribute) => {
                    const existing = existingProgramAttributesMap.get(
                        teta.trackedEntityAttribute.id
                    )

                    if (
                        existing &&
                        !previousTetaIdsRef.current.has(
                            teta.trackedEntityAttribute.id
                        )
                    ) {
                        return existing
                    }

                    return {
                        trackedEntityAttribute: teta.trackedEntityAttribute,
                        valueType: teta.trackedEntityAttribute.valueType,
                        unique: teta.trackedEntityAttribute.unique,
                        allowFutureDate: false,
                        mandatory: teta.mandatory,
                        searchable: teta.searchable,
                        displayInList: teta.displayInList,
                        renderType: defaultRenderType,
                    }
                }
            )

            const petas = input.value.filter((programAttribute) => {
                const attrId = programAttribute.trackedEntityAttribute.id

                if (tetaIds.has(attrId)) {
                    return false
                }

                if (previousTetaIdsRef.current.has(attrId)) {
                    return false
                }

                return true
            })

            previousTetaIdsRef.current = tetaIds

            input.onChange([...convertedTetas, ...petas])
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [trackedEntityTypeField.input.value?.id, tetaIdsString])

        const programHasDateAttributes = input.value.some(
            (attribute) => attribute.valueType === 'DATE'
        )

        return (
            <SectionedFormSection name={name}>
                <StandardFormSectionTitle>
                    {i18n.t('Enrollment: Data', { nsSeparator: '~:~' })}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the information to collect during enrollment.'
                    )}
                </StandardFormSectionDescription>
                <Field
                    error={meta.invalid}
                    validationText={
                        (meta.touched && meta.error?.toString()) || ''
                    }
                    name={name}
                    className={css.moduleTransferField}
                >
                    <ModelTransferFrom
                        transferSection={SECTIONS_MAP.trackedEntityAttribute}
                        selected={input.value.map((attribute) => {
                            const tea = attribute.trackedEntityAttribute
                            return {
                                ...tea,
                                disabled: tetaIds.has(tea.id),
                            }
                        })}
                        renderOption={({ value, ...rest }) => {
                            const tea = value
                            const isTeta = tetaMap.has(tea.id)
                            const tetDisplayName =
                                trackedEntityTypeField.input.value?.displayName

                            return (
                                <TransferOption
                                    {...rest}
                                    label={
                                        isTeta && tetDisplayName ? (
                                            <span>
                                                {tea.displayName}
                                                {' · '}
                                                {`${tetDisplayName} attribute`}
                                            </span>
                                        ) : (
                                            tea.displayName
                                        )
                                    }
                                    value={tea.id}
                                />
                            )
                        }}
                        onChange={({ selected }) => {
                            const existingAttributesMap = new Map(
                                input.value.map((attr) => [
                                    attr.trackedEntityAttribute.id,
                                    attr,
                                ])
                            )

                            const selectedAttributes = selected.map((s) => {
                                const existing = existingAttributesMap.get(s.id)
                                if (existing) {
                                    return existing
                                }

                                return {
                                    trackedEntityAttribute: {
                                        id: s.id,
                                        displayName: s.displayName,
                                    },
                                    valueType: s.valueType,
                                    optionSet: s.optionSet,
                                    unique: s.unique,
                                    allowFutureDate: false,
                                    mandatory: false,
                                    searchable: false,
                                    displayInList: false,
                                    renderType: defaultRenderType,
                                }
                            })

                            input.onChange(selectedAttributes)
                            input.onBlur()
                        }}
                        query={{
                            resource: 'trackedEntityAttributes',
                            params: {
                                fields: [
                                    'id',
                                    'displayName',
                                    'valueType',
                                    'optionSet',
                                    'unique',
                                ],
                                filter: tetaIdsString
                                    ? [`id:!in:[${tetaIdsString}]`]
                                    : undefined,
                            },
                        }}
                    />
                </Field>
                <StandardFormSectionTitle>
                    {i18n.t('Manage attributes')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Manage how the chosen attributes are collected and displayed.'
                    )}
                </StandardFormSectionDescription>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCellHead>{i18n.t('Name')}</TableCellHead>
                            <TableCellHead>{i18n.t('Required')}</TableCellHead>
                            <TableCellHead>
                                {i18n.t('Searchable')}
                            </TableCellHead>
                            <TableCellHead>
                                {i18n.t('Display in list')}
                            </TableCellHead>
                            {programHasDateAttributes && (
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
                        {input.value.map((attribute, index) => {
                            const attributeId =
                                attribute.trackedEntityAttribute.id
                            const teta = tetaMap.get(attributeId)
                            const isMandatoryDisabled = teta?.mandatory === true

                            const tetDisplayName =
                                trackedEntityTypeField.input.value?.displayName

                            return (
                                <TableRow key={attribute.id || attributeId}>
                                    <TableCell>
                                        <span
                                            style={{
                                                display: 'flex',
                                                gap: '6px',
                                            }}
                                        >
                                            {
                                                attribute.trackedEntityAttribute
                                                    .displayName
                                            }
                                            {teta && tetDisplayName && (
                                                <InfoIconWithTooltip
                                                    content={i18n.t(
                                                        'This attribute is defined at the tracked entity type level'
                                                    )}
                                                    text={`${tetDisplayName} attribute`}
                                                />
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipWrapper
                                            condition={isMandatoryDisabled}
                                            content={i18n.t(
                                                'This attribute is marked as required at the tracked entity type level'
                                            )}
                                        >
                                            <FieldRFF
                                                component={CheckboxFieldFF}
                                                name={`programTrackedEntityAttributes[${index}].mandatory`}
                                                type="checkbox"
                                                disabled={isMandatoryDisabled}
                                            />
                                        </TooltipWrapper>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipWrapper
                                            condition={
                                                attribute.trackedEntityAttribute
                                                    .unique
                                            }
                                            content={i18n.t(
                                                'Unique attributes are always searchable'
                                            )}
                                        >
                                            <FieldRFF
                                                component={CheckboxFieldFF}
                                                name={`programTrackedEntityAttributes[${index}].searchable`}
                                                type="checkbox"
                                                disabled={
                                                    attribute
                                                        .trackedEntityAttribute
                                                        .unique
                                                }
                                                format={(value) =>
                                                    attribute
                                                        .trackedEntityAttribute
                                                        .unique
                                                        ? true
                                                        : value
                                                }
                                            />
                                        </TooltipWrapper>
                                    </TableCell>
                                    <TableCell>
                                        <FieldRFF
                                            component={CheckboxFieldFF}
                                            name={`programTrackedEntityAttributes[${index}].displayInList`}
                                            type="checkbox"
                                        />
                                    </TableCell>
                                    {programHasDateAttributes && (
                                        <TableCell>
                                            <FieldRFF
                                                component={CheckboxFieldFF}
                                                name={`programTrackedEntityAttributes[${index}].allowFutureDate`}
                                                type="checkbox"
                                                disabled={
                                                    attribute?.valueType !==
                                                    'DATE'
                                                }
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <RenderingOptionsSelect
                                            fieldName="programTrackedEntityAttributes"
                                            index={index}
                                            device="DESKTOP"
                                            valueType={attribute.valueType}
                                            hasOptionSet={
                                                !!attribute.optionSet?.id ||
                                                !!attribute
                                                    .trackedEntityAttribute
                                                    .optionSet?.id
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <RenderingOptionsSelect
                                            fieldName="programTrackedEntityAttributes"
                                            index={index}
                                            device="MOBILE"
                                            valueType={attribute.valueType}
                                            hasOptionSet={
                                                !!attribute.optionSet?.id ||
                                                !!attribute
                                                    .trackedEntityAttribute
                                                    .optionSet?.id
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
    }
)
