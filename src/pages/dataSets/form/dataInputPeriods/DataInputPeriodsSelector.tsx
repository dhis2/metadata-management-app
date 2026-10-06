import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalTitle,
    ModalActions,
    ModalContent,
    SingleSelectOption,
    SingleSelectField,
    CalendarInput,
} from '@dhis2/ui'
import React, { useCallback, useState } from 'react'
import { Field, useField } from 'react-final-form'
import { useCurrentUser, useSystemSetting } from '../../../../lib'
import { DataInputPeriod } from '../../../../types/generated'
import styles from './DataInputPeriodsSelector.module.css'
import {
    formatISODateTimeString,
    convertToIso8601String,
    convertFromIso8601ToString,
} from './dateHelpers'
import { SupportedCalendar, SupportedDateFormat } from './periodTypesMapping'
import {
    useGetPeriods,
    useGetPeriodInformation,
    ExpandedDIP,
} from './useGetPeriods'

const DataInputPeriodModal = ({
    modalOpen,
    closeModal,
    editDIP,
    locale,
    calendar = 'gregory',
    dateFormat,
}: {
    modalOpen: boolean
    closeModal: () => void
    editDIP?: DataInputPeriod
    locale: string
    calendar: SupportedCalendar
    dateFormat: SupportedDateFormat
}) => {
    const { input } = useField('dataInputPeriods')

    const [selectedYear, setSelectedYear] = useState<string | undefined>(
        editDIP?.period?.id?.substring(0, 4)
    )
    const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(
        editDIP?.period?.id
    )
    const changeYear = (year: string) => {
        setSelectedPeriod(undefined)
        setSelectedYear(year)
    }
    const [openingDate, setOpeningDate] = useState<string | undefined>(
        editDIP?.openingDate?.substring(0, 10)
    )
    const [closingDate, setClosingDate] = useState<string | undefined>(
        editDIP?.closingDate?.substring(0, 10)
    )
    const isUpdatingExistingRule =
        selectedPeriod &&
        input.value.find(
            (dip: DataInputPeriod) => dip.period!.id === selectedPeriod
        )
    const { annual, periods, yearRange } = useGetPeriods({
        selectedYear,
        locale,
        calendar,
    })
    const closeDateBeforeStartDate = Boolean(
        closingDate && openingDate && closingDate < openingDate
    )
    const saveIsDisabled = Boolean(!selectedPeriod) || closeDateBeforeStartDate

    return (
        <Modal hide={!modalOpen} onClose={closeModal}>
            <ModalTitle>{i18n.t('Add period entry rule')}</ModalTitle>
            <ModalContent className={styles.modalItems}>
                {editDIP && (
                    <div className={styles.periodName}>
                        {
                            (editDIP.period as { id: string; name?: string })
                                ?.name
                        }
                    </div>
                )}
                {!editDIP && !annual && (
                    <SingleSelectField
                        label={i18n.t('Year')}
                        maxHeight="200px"
                        selected={selectedYear}
                        onChange={(e) => {
                            changeYear(e.selected)
                        }}
                    >
                        {yearRange.map((year) => (
                            <SingleSelectOption
                                key={year}
                                label={year}
                                value={year}
                            />
                        ))}
                    </SingleSelectField>
                )}
                {!editDIP && (
                    <SingleSelectField
                        label={i18n.t('Period')}
                        maxHeight="200px"
                        selected={selectedPeriod}
                        onChange={(e) => {
                            setSelectedPeriod(e.selected)
                        }}
                    >
                        {periods.map((period) => (
                            <SingleSelectOption
                                key={period.id}
                                label={period.displayName}
                                value={period.id}
                            />
                        ))}
                    </SingleSelectField>
                )}

                <CalendarInput
                    label={i18n.t('Opening date')}
                    onDateSelect={(date) => {
                        const selectedDate = date?.calendarDateString
                            ? convertToIso8601String(
                                  date?.calendarDateString,
                                  calendar,
                                  dateFormat as SupportedDateFormat
                              )
                            : ''
                        setOpeningDate(selectedDate)
                    }}
                    calendar={calendar}
                    date={
                        openingDate
                            ? convertFromIso8601ToString(
                                  openingDate,
                                  calendar,
                                  dateFormat as SupportedDateFormat
                              )
                            : ''
                    }
                    clearable
                    locale={locale}
                    format={dateFormat as SupportedDateFormat}
                />
                <div>
                    <CalendarInput
                        label={i18n.t('Closing date')}
                        onDateSelect={(date) => {
                            const selectedDate = date?.calendarDateString
                                ? convertToIso8601String(
                                      date?.calendarDateString,
                                      calendar,
                                      dateFormat as SupportedDateFormat
                                  )
                                : ''
                            setClosingDate(selectedDate)
                        }}
                        calendar={calendar}
                        date={
                            closingDate
                                ? convertFromIso8601ToString(
                                      closingDate,
                                      calendar,
                                      dateFormat as SupportedDateFormat
                                  )
                                : ''
                        }
                        clearable
                        locale={locale}
                        format={dateFormat as SupportedDateFormat}
                    />
                    {closeDateBeforeStartDate && (
                        <div className={styles.validDateRangeWarning}>
                            {i18n.t('Closing date must be after start date')}
                        </div>
                    )}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip>
                    <Button onClick={closeModal}>{i18n.t('Cancel')}</Button>
                    <Button
                        disabled={saveIsDisabled}
                        primary
                        onClick={() => {
                            if (selectedPeriod === undefined) {
                                return
                            }
                            const newDataInputPeriod: DataInputPeriod = {
                                period: {
                                    id: selectedPeriod,
                                },
                            }
                            if (openingDate) {
                                newDataInputPeriod.openingDate = openingDate
                            }
                            if (closingDate) {
                                newDataInputPeriod.closingDate = closingDate
                            }
                            // clear edit information (if there is any)
                            input.onChange([
                                ...input.value.filter(
                                    (dip: DataInputPeriod) =>
                                        dip.period!.id !== selectedPeriod
                                ),
                                newDataInputPeriod,
                            ])
                            closeModal()
                        }}
                    >
                        {isUpdatingExistingRule
                            ? i18n.t('Update period entry rule')
                            : i18n.t('Add period entry rule')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

const DIPItem = ({
    expandedDip,
    onRemove,
    openEditModal,
    calendar,
    dateFormat = 'YYYY-MM-DD',
}: {
    expandedDip: ExpandedDIP
    onRemove: (id: string) => void
    openEditModal: (d: DataInputPeriod) => void
    calendar: SupportedCalendar
    dateFormat: SupportedDateFormat
}) => {
    const formattedClosingDate = formatISODateTimeString(
        expandedDip.closingDate,
        dateFormat,
        calendar as SupportedCalendar
    )

    const formattedOpeningDate = formatISODateTimeString(
        expandedDip.openingDate,
        dateFormat,
        calendar as SupportedCalendar
    )
    return (
        <div className={styles.dataInputPeriodItemContainer}>
            <div>
                <div>{expandedDip?.periodInformation.displayName}</div>
                <div className={styles.dataInputDateSpan}>
                    <div>
                        {expandedDip.openingDate ? (
                            <span>
                                {i18n.t('Opening date: {{openingDate}}', {
                                    openingDate: formattedOpeningDate,
                                    nsSeparator: '-:-',
                                })}
                            </span>
                        ) : (
                            <span>{i18n.t('No opening date')}</span>
                        )}
                    </div>
                    <div>
                        {expandedDip.closingDate ? (
                            <span>
                                {i18n.t('Closing date: {{closingDate}}', {
                                    closingDate: formattedClosingDate,
                                    nsSeparator: '-:-',
                                })}
                            </span>
                        ) : (
                            <span>{i18n.t('No closing date')}</span>
                        )}
                    </div>
                </div>
            </div>
            <ButtonStrip>
                <Button
                    small
                    onClick={() => {
                        ;(
                            expandedDip.period as {
                                id: string
                                name?: string
                            }
                        ).name = expandedDip.periodInformation.displayName
                        openEditModal(expandedDip)
                    }}
                >
                    {i18n.t('Edit')}
                </Button>
                <Button
                    small
                    secondary
                    destructive
                    onClick={() => {
                        onRemove(expandedDip.period!.id)
                    }}
                >
                    {i18n.t('Remove')}
                </Button>
            </ButtonStrip>
        </div>
    )
}

const DataInputPeriodsField = ({
    input,
    dateFormat,
    locale,
    calendar,
    openEditModal,
}: {
    input: {
        value: DataInputPeriod[]
        onChange: (value: DataInputPeriod[]) => void
        onBlur: () => void
    }
    dateFormat: SupportedDateFormat
    locale: string
    calendar: SupportedCalendar
    openEditModal: (dip: DataInputPeriod) => void
}) => {
    const { value, onBlur, onChange } = input
    const mappedPeriods = useGetPeriodInformation(
        value,
        calendar as SupportedCalendar,
        locale
    )
    const onRemove = useCallback(
        (id: string) => {
            onChange(
                value.filter((dip: DataInputPeriod) => dip.period!.id !== id)
            )
            onBlur()
        },
        [onChange, onBlur, value]
    )

    return (
        <>
            {mappedPeriods.map((expandedDip) => (
                <DIPItem
                    expandedDip={expandedDip}
                    key={expandedDip.period!.id}
                    onRemove={onRemove}
                    openEditModal={openEditModal}
                    calendar={calendar as SupportedCalendar}
                    dateFormat={dateFormat as SupportedDateFormat}
                />
            ))}
        </>
    )
}

export const DataInputPeriodsSelector = () => {
    const currentUser = useCurrentUser()
    const locale = String(currentUser.settings.keyUiLocale) ?? 'en'
    const calendar = useSystemSetting('keyCalendar') ?? 'gregory'
    const keyDateFormat = useSystemSetting('keyDateFormat')
    const dateFormat = keyDateFormat
        ? keyDateFormat.toUpperCase()
        : 'YYYY-MM-DD'
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [modalEditDIP, setModalEditDIP] = useState<
        DataInputPeriod | undefined
    >()
    const closeModal = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])
    const openEditModal = useCallback(
        (dip: DataInputPeriod) => {
            setModalEditDIP(dip)
            setModalOpen(true)
        },
        [setModalEditDIP, setModalOpen]
    )

    return (
        <>
            <Button
                small
                onClick={() => {
                    // clears out any previous edit information if there is any
                    setModalEditDIP(undefined)
                    setModalOpen(true)
                }}
            >
                {i18n.t('Add a period entry rule')}
            </Button>
            {modalOpen && (
                <DataInputPeriodModal
                    modalOpen={modalOpen}
                    closeModal={closeModal}
                    editDIP={modalEditDIP}
                    locale={locale}
                    calendar={calendar as SupportedCalendar}
                    dateFormat={dateFormat as SupportedDateFormat}
                />
            )}
            <Field name="dataInputPeriods">
                {({ input }) => (
                    <DataInputPeriodsField
                        input={input}
                        dateFormat={dateFormat as SupportedDateFormat}
                        locale={locale}
                        calendar={calendar as SupportedCalendar}
                        openEditModal={openEditModal}
                    />
                )}
            </Field>
        </>
    )
}
