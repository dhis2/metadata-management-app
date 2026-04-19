import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    IconChevronDown16,
    IconDelete16,
    Input,
    InputField,
    Layer,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
    Popper,
    TableBody,
    TableFoot,
    TableHead,
} from '@dhis2/ui'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SketchPicker } from 'react-color'
import { useField } from 'react-final-form'
import { generateDhis2Id } from '../../../../lib/models/uid'
import { LegendItem } from '../legendSetSchema'
import {
    COLOR_SCALES,
    MIN_CLASSES,
    MAX_CLASSES,
    generateLegendItems,
} from './colorScales'
import classes from './LegendsField.module.css'

const DEFAULT_COLOR = '#FFA500'
const DEFAULT_STEP = 10
const LIGHTNESS_SHIFT = -0.08

function hexToHsl(hex: string): [number, number, number] {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) {
        return [0, 0, l]
    }
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    } else if (max === g) {
        h = ((b - r) / d + 2) / 6
    } else {
        h = ((r - g) / d + 4) / 6
    }
    return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
    const hue = ((h % 360) + 360) % 360
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0,
        g = 0,
        b = 0
    if (hue < 60) {
        r = c
        g = x
    } else if (hue < 120) {
        r = x
        g = c
    } else if (hue < 180) {
        g = c
        b = x
    } else if (hue < 240) {
        g = x
        b = c
    } else if (hue < 300) {
        r = x
        b = c
    } else {
        r = c
        b = x
    }
    const toHex = (v: number) =>
        Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function shiftColor(hex: string): string {
    const [h, s, l] = hexToHsl(hex)
    const newL = Math.min(0.9, Math.max(0.15, l + LIGHTNESS_SHIFT))
    return hslToHex(h, s, newL)
}

function LegendGeneratorWrenchIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className={classes.legendGeneratorWrench}
            aria-hidden="true"
        >
            <path
                fillRule="evenodd"
                d="M11.28 2.013 10 3.293V6h2.707l1.28-1.28a3 3 0 1 1-2.707-2.707Zm1.165-.744a4 4 0 0 0-5.31 4.767l-5.55 5.55a2 2 0 1 0 2.83 2.828l5.549-5.55A4.005 4.005 0 0 0 15 5c0-.509-.095-.996-.27-1.445a.5.5 0 0 0-.819-.173L12.293 5H11V3.707l1.618-1.618a.5.5 0 0 0-.173-.82ZM8.968 8.446l-5.26 5.261a1 1 0 0 1-1.415-1.414l5.26-5.261c.345.582.833 1.07 1.415 1.414Z"
                clipRule="evenodd"
            />
        </svg>
    )
}

type LegendGeneratorInputsProps = {
    startValue: string
    setStartValue: (v: string) => void
    endValue: string
    setEndValue: (v: string) => void
    numClasses: number
    setNumClasses: (n: number) => void
    setSelectedScaleIndex: (i: number) => void
    selectedScale: (typeof COLOR_SCALES)[number]
    scalePickerOpen: boolean
    setScalePickerOpen: (o: boolean) => void
    scaleButtonRef: React.RefObject<HTMLButtonElement>
}

function LegendGeneratorInputs({
    startValue,
    setStartValue,
    endValue,
    setEndValue,
    numClasses,
    setNumClasses,
    setSelectedScaleIndex,
    selectedScale,
    scalePickerOpen,
    setScalePickerOpen,
    scaleButtonRef,
}: Readonly<LegendGeneratorInputsProps>) {
    return (
        <div className={classes.generateInputs}>
            <InputField
                label={i18n.t('Start value')}
                value={startValue}
                type="number"
                onChange={(e: { value?: string }) =>
                    setStartValue(e.value ?? '')
                }
                inputWidth="120px"
            />
            <InputField
                label={i18n.t('End value')}
                value={endValue}
                type="number"
                onChange={(e: { value?: string }) => setEndValue(e.value ?? '')}
                inputWidth="120px"
            />
            <InputField
                label={i18n.t('Items')}
                value={String(numClasses)}
                type="number"
                min={String(MIN_CLASSES)}
                max={String(MAX_CLASSES)}
                step="1"
                onChange={(e: { value?: string }) => {
                    const raw = e.value ?? ''
                    if (raw === '') {
                        return
                    }
                    const n = Number.parseInt(raw, 10)
                    if (Number.isNaN(n)) {
                        return
                    }
                    setNumClasses(
                        Math.min(MAX_CLASSES, Math.max(MIN_CLASSES, n))
                    )
                }}
                inputWidth="80px"
            />
            <div className={classes.colorScaleSelector}>
                <span className={classes.colorScaleLabel}>
                    {i18n.t('Color scale')}
                </span>
                <button
                    type="button"
                    ref={scaleButtonRef}
                    className={classes.colorScaleButton}
                    onClick={() => setScalePickerOpen(!scalePickerOpen)}
                >
                    <ColorScalePreview
                        colors={selectedScale.scale[numClasses] || []}
                    />
                    <IconChevronDown16 />
                </button>
                {scalePickerOpen && (
                    <Layer onBackdropClick={() => setScalePickerOpen(false)}>
                        <Popper
                            placement="bottom-start"
                            reference={scaleButtonRef}
                        >
                            <div className={classes.colorScalePopover}>
                                {COLOR_SCALES.map((scaleDef, index) => (
                                    <button
                                        key={scaleDef.name}
                                        type="button"
                                        className={classes.colorScaleOption}
                                        onClick={() => {
                                            setSelectedScaleIndex(index)
                                            setScalePickerOpen(false)
                                        }}
                                    >
                                        <ColorScalePreview
                                            colors={
                                                scaleDef.scale[numClasses] || []
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                        </Popper>
                    </Layer>
                )}
            </div>
        </div>
    )
}

export function LegendsField() {
    const validator = (value: LegendItem[]) => {
        if (!value || value.length === 0) {
            return undefined
        }
        const errors: string[] = []
        if (value.some((item) => item.endValue <= item.startValue)) {
            errors.push(i18n.t('End value must be greater than start value.'))
        }
        const sorted = [...value].sort((a, b) => a.startValue - b.startValue)
        let hasOverlap = false
        let hasGap = false
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i]
            const next = sorted[i + 1]
            if (current.endValue > next.startValue) {
                hasOverlap = true
            }
            if (current.endValue < next.startValue) {
                hasGap = true
            }
        }
        if (hasOverlap) {
            errors.push(i18n.t('Legend items must not overlap.'))
        }
        if (hasGap) {
            errors.push(i18n.t('Legend items must not have gaps.'))
        }
        return errors.length > 0 ? errors.join(' ') : undefined
    }
    const { input, meta } = useField<LegendItem[]>('legends', {
        validate: validator,
    })
    const legends: LegendItem[] = useMemo(
        () => input.value || [],
        [input.value]
    )

    const [modalOpen, setModalOpen] = useState(false)

    const [startValue, setStartValue] = useState('0')
    const [endValue, setEndValue] = useState('100')
    const [selectedScaleIndex, setSelectedScaleIndex] = useState(0)
    const [numClasses, setNumClasses] = useState(5)
    const [scalePickerOpen, setScalePickerOpen] = useState(false)
    const scaleButtonRef = useRef<HTMLButtonElement>(null)

    const selectedScale = COLOR_SCALES[selectedScaleIndex]

    const [sortedLegends, setSortedLegends] = useState<LegendItem[]>([])

    useEffect(() => {
        setSortedLegends((prev) => {
            const prevIds = new Set(prev.map((l) => l.id))
            const idsChanged =
                prev.length !== legends.length ||
                legends.some((l) => !prevIds.has(l.id))
            if (idsChanged) {
                return [...legends].sort((a, b) => a.startValue - b.startValue)
            }
            const legendMap = new Map(legends.map((l) => [l.id, l]))
            return prev.map((l) => legendMap.get(l.id) ?? l)
        })
    }, [legends])

    const handleItemBlur = useCallback(() => {
        setSortedLegends((prev) =>
            [...prev].sort((a, b) => a.startValue - b.startValue)
        )
    }, [])

    useEffect(() => {
        if (legends.length === 0) {
            setModalOpen(false)
        }
    }, [legends.length])

    const validationIssueIds = useMemo(() => {
        const ids = new Set<string>()
        for (let i = 0; i < sortedLegends.length; i++) {
            const current = sortedLegends[i]
            console.log(current)
            const next =
                i === sortedLegends.length ? undefined : sortedLegends[i + 1]
            if (current.endValue < current.startValue) {
                console.log('you not triggered?')
                ids.add(current.id)
            }
            if (
                next &&
                (current.endValue > next?.startValue ||
                    next?.startValue > current.endValue)
            ) {
                ids.add(current.id)
                ids.add(next?.id)
            }
        }
        return ids
    }, [sortedLegends])

    const updateItem = useCallback(
        (id: string, patch: Partial<LegendItem>) => {
            const updated = legends.map((l) =>
                l.id === id ? { ...l, ...patch } : l
            )
            input.onChange(updated)
            input.onBlur()
        },
        [legends, input]
    )

    const handleDeleteItem = useCallback(
        (id: string) => {
            input.onChange(legends.filter((l) => l.id !== id))
            input.onBlur()
        },
        [legends, input]
    )

    const handleAddItem = useCallback(() => {
        const sorted = [...legends].sort((a, b) => a.startValue - b.startValue)
        const last = sorted.at(-1)

        const newStart = last ? last.endValue : 0
        const newEnd = newStart + DEFAULT_STEP
        const newName = `${newStart} - ${newEnd}`

        const newColor = last ? shiftColor(last.color) : DEFAULT_COLOR

        const newItem: LegendItem = {
            id: generateDhis2Id(),
            name: newName,
            startValue: newStart,
            endValue: newEnd,
            color: newColor,
        }

        input.onChange([...legends, newItem])
        input.onBlur()
    }, [legends, input])

    const doGenerate = useCallback(() => {
        const start = Number.parseFloat(startValue)
        const end = Number.parseFloat(endValue)
        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
            return
        }
        const colors = selectedScale.scale[numClasses]
        if (!colors) {
            return
        }
        const items = generateLegendItems(start, end, colors)
        input.onChange(items)
        input.onBlur()
        setModalOpen(false)
    }, [startValue, endValue, selectedScale, numClasses, input])

    const startNum = Number.parseFloat(startValue)
    const endNum = Number.parseFloat(endValue)
    const generateDisabled =
        startValue === '' ||
        endValue === '' ||
        Number.isNaN(startNum) ||
        Number.isNaN(endNum) ||
        endNum <= startNum

    const generatorInputsProps: LegendGeneratorInputsProps = {
        startValue,
        setStartValue,
        endValue,
        setEndValue,
        numClasses,
        setNumClasses,
        setSelectedScaleIndex,
        selectedScale,
        scalePickerOpen,
        setScalePickerOpen,
        scaleButtonRef,
    }

    const fieldError =
        meta.touched && meta.error && typeof meta.error === 'string'
            ? meta.error
            : undefined

    const hasItems = sortedLegends.length > 0

    return (
        <div>
            {hasItems && (
                <div className={classes.openGeneratorWrap}>
                    <Button secondary onClick={() => setModalOpen(true)}>
                        {i18n.t('Generate a new legend...')}
                    </Button>
                </div>
            )}

            {modalOpen && (
                <Modal
                    large
                    onClose={() => setModalOpen(false)}
                    dataTest="legend-generator-modal"
                >
                    <ModalTitle>{i18n.t('Legend generator')}</ModalTitle>
                    <ModalContent>
                        <NoticeBox
                            warning
                            title={i18n.t('Replace existing legend items')}
                        >
                            {i18n.t(
                                'Generating new legend items will replace all legend items in the table.'
                            )}
                        </NoticeBox>
                        <div className={classes.modalGeneratorBody}>
                            <LegendGeneratorInputs {...generatorInputsProps} />
                        </div>
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button
                                secondary
                                onClick={() => setModalOpen(false)}
                            >
                                {i18n.t('Cancel')}
                            </Button>
                            <Button
                                primary
                                onClick={doGenerate}
                                disabled={generateDisabled}
                            >
                                {i18n.t('Create legend items')}
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}

            <DataTable>
                {hasItems && (
                    <TableHead>
                        <DataTableRow>
                            <DataTableColumnHeader />
                            <DataTableColumnHeader>
                                {i18n.t('Name')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('Start value')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader>
                                {i18n.t('End value')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader />
                        </DataTableRow>
                    </TableHead>
                )}
                <TableBody>
                    {sortedLegends.length === 0 && (
                        <DataTableRow>
                            <DataTableCell staticStyle colSpan="5">
                                <div className={classes.emptyStateCell}>
                                    <div
                                        className={classes.emptyStateGenerator}
                                    >
                                        <div
                                            className={classes.emptyStateTitle}
                                        >
                                            {i18n.t('Generate a legend')}
                                        </div>
                                        <div className={classes.generateBody}>
                                            <LegendGeneratorInputs
                                                {...generatorInputsProps}
                                            />
                                            <Button
                                                onClick={doGenerate}
                                                disabled={generateDisabled}
                                            >
                                                {i18n.t(
                                                    'Generate legend items'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className={classes.manualAddRow}>
                                        <div
                                            className={classes.emptyStateTitle}
                                        >
                                            {i18n.t(
                                                'Manually add legend items'
                                            )}
                                        </div>
                                        <div className={classes.manualAddBody}>
                                            <Button
                                                small
                                                onClick={handleAddItem}
                                            >
                                                {i18n.t('Add legend item')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DataTableCell>
                        </DataTableRow>
                    )}
                    {sortedLegends.map((item) => (
                        <InlineLegendItemRow
                            key={item.id}
                            item={item}
                            isValidationViolation={validationIssueIds.has(
                                item.id
                            )}
                            onUpdate={updateItem}
                            onDelete={handleDeleteItem}
                            onBlur={handleItemBlur}
                        />
                    ))}
                </TableBody>
                {hasItems && (
                    <TableFoot>
                        <DataTableRow>
                            <DataTableCell staticStyle colSpan="5">
                                <Button small onClick={handleAddItem}>
                                    {i18n.t('Add legend item')}
                                </Button>
                            </DataTableCell>
                        </DataTableRow>
                    </TableFoot>
                )}
            </DataTable>

            {fieldError && (
                <div className={classes.validationError}>{fieldError}</div>
            )}
        </div>
    )
}

function InlineLegendItemRow({
    item,
    isValidationViolation,
    onUpdate,
    onDelete,
    onBlur,
}: Readonly<{
    item: LegendItem
    isValidationViolation: boolean
    onUpdate: (id: string, patch: Partial<LegendItem>) => void
    onDelete: (id: string) => void
    onBlur: () => void
}>) {
    const [colorPickerOpen, setColorPickerOpen] = useState(false)
    const colorRef = useRef<HTMLButtonElement>(null)

    return (
        <DataTableRow
            className={
                isValidationViolation
                    ? classes.legendItemRowValidationViolation
                    : ''
            }
        >
            <DataTableCell width="52px" staticStyle>
                <button
                    type="button"
                    ref={colorRef}
                    className={classes.legendItemColorButton}
                    style={{ background: item.color }}
                    onClick={() => setColorPickerOpen(!colorPickerOpen)}
                    aria-label={i18n.t('Change color')}
                />
                {colorPickerOpen && (
                    <Layer onBackdropClick={() => setColorPickerOpen(false)}>
                        <Popper placement="bottom-start" reference={colorRef}>
                            <div className={classes.inlineColorPicker}>
                                <SketchPicker
                                    color={item.color}
                                    disableAlpha
                                    onChangeComplete={({
                                        hex,
                                    }: {
                                        hex: string
                                    }) => {
                                        onUpdate(item.id, { color: hex })
                                    }}
                                />
                            </div>
                        </Popper>
                    </Layer>
                )}
            </DataTableCell>
            <DataTableCell staticStyle>
                <Input
                    value={item.name}
                    onChange={(e: { value?: string }) =>
                        onUpdate(item.id, { name: e.value ?? '' })
                    }
                    onBlur={onBlur}
                    dense
                />
            </DataTableCell>
            <DataTableCell staticStyle>
                <Input
                    value={String(item.startValue)}
                    type="number"
                    onChange={(e: { value?: string }) => {
                        const num = Number.parseFloat(e.value ?? '')
                        if (!Number.isNaN(num)) {
                            onUpdate(item.id, { startValue: num })
                        }
                    }}
                    onBlur={onBlur}
                    dense
                />
            </DataTableCell>
            <DataTableCell staticStyle>
                <Input
                    value={String(item.endValue)}
                    type="number"
                    onChange={(e: { value?: string }) => {
                        const num = Number.parseFloat(e.value ?? '')
                        if (!Number.isNaN(num)) {
                            onUpdate(item.id, { endValue: num })
                        }
                    }}
                    onBlur={onBlur}
                    dense
                />
            </DataTableCell>
            <DataTableCell width="52px" staticStyle>
                <Button
                    small
                    secondary
                    destructive
                    icon={<IconDelete16 />}
                    aria-label={i18n.t('Delete')}
                    onClick={() => onDelete(item.id)}
                />
            </DataTableCell>
        </DataTableRow>
    )
}

function ColorScalePreview({ colors }: Readonly<{ colors: string[] }>) {
    return (
        <div className={classes.colorScalePreview}>
            {colors.map((color) => (
                <span
                    key={color}
                    className={classes.colorScalePreviewCell}
                    style={{ background: color }}
                />
            ))}
        </div>
    )
}
