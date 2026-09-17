import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Field,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import React, { useCallback, useMemo, useState } from 'react'
import { useField } from 'react-final-form'
import { PeriodTypeSelect } from '../../../components/metadataFormControls/PeriodTypeSelect/PeriodTypeSelect'
import {
    AnalyticsPeriodBoundary,
    AnalyticsPeriodBoundaryType,
} from '../../../types/generated'
import styles from '../../dataSets/form/dataInputPeriods/DataInputPeriodsSelector.module.css'
import classes from './AnalyticsPeriodBoundaries.module.css'
import offsetPeriodType = AnalyticsPeriodBoundary.offsetPeriodType

const boundaryTargets = [
    {
        label: i18n.t('Incident date'),
        value: 'INCIDENT_DATE',
    },
    {
        label: i18n.t('Event date'),
        value: 'EVENT_DATE',
    },
    {
        label: i18n.t('Enrollment date'),
        value: 'ENROLLMENT_DATE',
    },
    {
        label: i18n.t('Custom'),
        value: 'CUSTOM',
    },
]

const boundaryTypes = [
    {
        label: i18n.t('Before start of reporting period'),
        value: AnalyticsPeriodBoundaryType.BEFORE_START_OF_REPORTING_PERIOD,
    },
    {
        label: i18n.t('Before end of reporting period'),
        value: AnalyticsPeriodBoundaryType.BEFORE_END_OF_REPORTING_PERIOD,
    },
    {
        label: i18n.t('After start of reporting period'),
        value: AnalyticsPeriodBoundaryType.AFTER_START_OF_REPORTING_PERIOD,
    },
    {
        label: i18n.t('After end of reporting period'),
        value: AnalyticsPeriodBoundaryType.AFTER_END_OF_REPORTING_PERIOD,
    },
]

const PeriodBoundaryItem = ({
    periodBoundary,
    onRemove,
    onEdit,
}: {
    periodBoundary: Partial<AnalyticsPeriodBoundary>
    onRemove: () => void
    onEdit: (periodBoundary: Partial<AnalyticsPeriodBoundary>) => void
}) => {
    const foundBoundaryTarget = useMemo(
        () =>
            boundaryTargets.find(
                (target) => periodBoundary.boundaryTarget === target.value
            ),
        [periodBoundary]
    )
    const foundBoundaryType = useMemo(
        () =>
            boundaryTypes.find(
                (type) =>
                    periodBoundary.analyticsPeriodBoundaryType === type.value
            ),
        [periodBoundary]
    )
    return (
        <div
            className={classes.analyticsPeriodBoundaryContainer}
            data-test="analytics-period-boundary"
        >
            <div>
                <div>
                    {foundBoundaryTarget?.label ??
                        `${i18n.t('Custom')}: ${periodBoundary.boundaryTarget}`}
                </div>
                <div className={classes.analyticsPeriodBoundarySpan}>
                    {periodBoundary.offsetPeriodType && (
                        <div>
                            {i18n.t('Period')}:{' '}
                            {periodBoundary.offsetPeriodType}
                        </div>
                    )}
                    {periodBoundary.offsetPeriods !== undefined && (
                        <div>
                            {i18n.t('Offset')}: {periodBoundary.offsetPeriods}
                        </div>
                    )}
                    {foundBoundaryType && (
                        <div>
                            {i18n.t('Type')}: {foundBoundaryType.label}
                        </div>
                    )}
                </div>
            </div>
            <ButtonStrip>
                <Button
                    small
                    dataTest="apb-edit-button"
                    onClick={() => {
                        onEdit(periodBoundary)
                    }}
                >
                    {i18n.t('Edit')}
                </Button>
                <Button
                    small
                    dataTest="apb-remove-button"
                    secondary
                    destructive
                    onClick={() => {
                        onRemove()
                    }}
                >
                    {i18n.t('Remove')}
                </Button>
            </ButtonStrip>
        </div>
    )
}
const PeriodBoundaryItemForm = ({
    periodBoundary,
    onFieldChange,
}: {
    periodBoundary: Partial<AnalyticsPeriodBoundary>
    onFieldChange: (periodBoundary: Partial<AnalyticsPeriodBoundary>) => void
}) => {
    const filteredBoundaryTargets = useMemo(
        () =>
            boundaryTargets.filter(
                (e) =>
                    e.value !== 'CUSTOM' &&
                    e.value === periodBoundary.boundaryTarget
            ).length,
        [periodBoundary]
    )

    const [customBoundaryTarget, setCustomBoundaryTarget] = useState(
        periodBoundary.boundaryTarget && filteredBoundaryTargets === 0
    )

    return (
        <div className={classes.analyticsPeriodBoundaryForm}>
            <SingleSelectField
                dataTest="apb-target-select"
                selected={
                    customBoundaryTarget
                        ? 'CUSTOM'
                        : boundaryTargets.find(
                              (e) => e.value === periodBoundary.boundaryTarget
                          )?.value
                }
                onChange={({ selected }) => {
                    if (selected === 'CUSTOM') {
                        setCustomBoundaryTarget(true)
                        onFieldChange({
                            boundaryTarget: '',
                        })
                    } else {
                        setCustomBoundaryTarget(false)
                        onFieldChange({ boundaryTarget: selected })
                    }
                }}
                label={i18n.t('Boundary target')}
            >
                {boundaryTargets.map((option) => (
                    <SingleSelectOption key={option.value} {...option} />
                ))}
            </SingleSelectField>
            {customBoundaryTarget && (
                <InputField
                    dataTest="apb-custom-target-text"
                    label={i18n.t('Custom boundary text')}
                    onChange={(e) => onFieldChange({ boundaryTarget: e.value })}
                    value={periodBoundary.boundaryTarget}
                />
            )}
            <SingleSelectField
                selected={periodBoundary.analyticsPeriodBoundaryType}
                dataTest="apb-type-select"
                onChange={({ selected }) => {
                    onFieldChange({
                        analyticsPeriodBoundaryType:
                            selected as AnalyticsPeriodBoundaryType,
                    })
                }}
                label={i18n.t('Analytics period boundary type')}
            >
                <SingleSelectOption label={'<No value>'} value={''} />
                {boundaryTypes.map((option) => (
                    <SingleSelectOption key={option.value} {...option} />
                ))}
            </SingleSelectField>
            <InputField
                type="number"
                dataTest="apb-offset-input"
                label={i18n.t('Offset period by amount')}
                onChange={(e) =>
                    onFieldChange({
                        offsetPeriods: e.value ? parseInt(e.value) : undefined,
                    })
                }
                value={periodBoundary.offsetPeriods?.toString()}
                dense
                min={'0'}
            />
            <Field label={i18n.t('Period type')}>
                <PeriodTypeSelect
                    selected={periodBoundary.offsetPeriodType}
                    onChange={(selected) => {
                        onFieldChange({
                            offsetPeriodType: selected as offsetPeriodType,
                        })
                    }}
                    noValueOption
                    dataTest="apb-period-type-select"
                />
            </Field>
        </div>
    )
}

const AnalyticsPeriodBoundaryModal = ({
    closeModal,
    onSavePeriodBoundary,
    periodBoundary,
}: {
    closeModal: () => void
    onSavePeriodBoundary: (
        periodBoundary: Partial<AnalyticsPeriodBoundary>
    ) => void
    periodBoundary: Partial<AnalyticsPeriodBoundary>
}) => {
    const [editedPeriodBoundary, setEditedPeriodBoundary] =
        useState(periodBoundary)
    const onFieldChange = (changes: Partial<AnalyticsPeriodBoundary>) => {
        setEditedPeriodBoundary((previous) => ({ ...previous, ...changes }))
    }

    return (
        <Modal onClose={closeModal} dataTest="analytics-period-boundary-modal">
            <ModalTitle>
                {editedPeriodBoundary
                    ? i18n.t('Edit analytics period boundary')
                    : i18n.t('Add analytics period boundary')}
            </ModalTitle>
            <ModalContent className={styles.modalItems}>
                <PeriodBoundaryItemForm
                    key={editedPeriodBoundary.id}
                    periodBoundary={editedPeriodBoundary}
                    onFieldChange={onFieldChange}
                />
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={closeModal}>{i18n.t('Cancel')}</Button>
                    <Button
                        dataTest="save-apb-button"
                        primary
                        onClick={() => {
                            onSavePeriodBoundary(editedPeriodBoundary)
                        }}
                    >
                        {editedPeriodBoundary?.id
                            ? i18n.t('Update analytics period boundary')
                            : i18n.t('Add analytics period boundary')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export const AnalyticsPeriodBoundariesField = () => {
    const [modalPeriodBoundary, setModalPeriodBoundary] =
        useState<Partial<AnalyticsPeriodBoundary> | null>(null)
    const [abpIndex, setAbpIndex] = useState<number | null>(null)

    const { input } = useField<Partial<AnalyticsPeriodBoundary>[]>(
        'analyticsPeriodBoundaries'
    )
    const { value, onBlur, onChange } = input

    const closeModal = () => {
        setModalPeriodBoundary(null)
        setAbpIndex(null)
    }

    const onRemovePeriodBoundary = useCallback(
        (index: number) => () => {
            onChange(value.filter((_, i) => i !== index))
            onBlur()
        },
        [onChange, onBlur, value]
    )

    const onSavePeriodBoundary = useCallback(
        (editedPeriodBoundary: Partial<AnalyticsPeriodBoundary>) => {
            if (abpIndex !== null) {
                const copy = [...value]
                copy[abpIndex] = editedPeriodBoundary
                onChange(copy)
            }
            onBlur()
            closeModal()
        },
        [onChange, onBlur, value, abpIndex]
    )

    return (
        <>
            <Button
                small
                onClick={() => {
                    setModalPeriodBoundary({})
                    setAbpIndex(value.length)
                }}
                dataTest="add-boundary-button"
            >
                {i18n.t('Add a period boundary')}
            </Button>
            {modalPeriodBoundary && (
                <AnalyticsPeriodBoundaryModal
                    periodBoundary={modalPeriodBoundary}
                    closeModal={closeModal}
                    onSavePeriodBoundary={onSavePeriodBoundary}
                />
            )}
            {value &&
                value.map(
                    (
                        periodBoundary: Partial<AnalyticsPeriodBoundary>,
                        index: number
                    ) => (
                        <PeriodBoundaryItem
                            periodBoundary={periodBoundary}
                            key={periodBoundary.id ?? `new-apb-${index}`}
                            onRemove={onRemovePeriodBoundary(index)}
                            onEdit={(value) => {
                                setModalPeriodBoundary(value)
                                setAbpIndex(index)
                            }}
                        />
                    )
                )}
        </>
    )
}
