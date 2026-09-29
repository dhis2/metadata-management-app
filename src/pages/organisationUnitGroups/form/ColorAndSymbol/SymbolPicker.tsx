import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    IconChevronDown16,
    IconChevronUp16,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import cx from 'classnames'
import React, { useState } from 'react'
import { EmptySwatchIcon } from '../../../../components/ColorAndIconPicker/EmptySwatchIcon'
import classes from './SymbolPicker.module.css'

// Organisation unit group symbols are static assets bundled with the server,
// not an API resource - there are exactly 40 of them, numbered 1 through 40.
// 01-25 are png files; 26-40 are svg files
const SYMBOL_COUNT = 40
const SYMBOL_FILENAMES = Array.from(
    { length: SYMBOL_COUNT },
    (_, index) =>
        `${String(index + 1).padStart(2, '0')}.${index <= 24 ? 'png' : 'svg'}`
)

const getSymbolUrl = (baseUrl: string, filename: string) =>
    `${baseUrl}/images/orgunitgroup/${filename}`

function SymbolPickerModal({
    selected,
    onChange,
    onCancel,
}: Readonly<{
    selected: string
    onChange: ({ symbol }: { symbol: string }) => void
    onCancel: () => void
}>) {
    const { baseUrl } = useConfig()
    const [symbol, setSymbol] = useState(selected)

    return (
        <Modal large onClose={onCancel}>
            <ModalTitle>{i18n.t('Choose a symbol')}</ModalTitle>

            <ModalContent>
                <div
                    className={classes.symbolsContainer}
                    data-test="symbols-container"
                    aria-label={i18n.t('Available symbols')}
                >
                    {SYMBOL_FILENAMES.map((filename) => (
                        <button
                            key={filename}
                            type="button"
                            aria-pressed={filename === symbol}
                            className={cx(classes.symbolContainer, {
                                [classes.active]: filename === symbol,
                            })}
                            onClick={() => setSymbol(filename)}
                            title={filename}
                        >
                            <img
                                className={classes.symbolImage}
                                alt={filename}
                                src={getSymbolUrl(baseUrl, filename)}
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            </ModalContent>

            <ModalActions>
                <ButtonStrip>
                    <Button
                        primary
                        disabled={!symbol}
                        onClick={() => onChange({ symbol })}
                    >
                        {i18n.t('Choose symbol')}
                    </Button>

                    <Button
                        secondary
                        destructive
                        disabled={!symbol}
                        onClick={() => onChange({ symbol: '' })}
                    >
                        {i18n.t('Remove symbol')}
                    </Button>

                    <Button secondary onClick={onCancel}>
                        {i18n.t('Cancel')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

export function SymbolPicker({
    symbol = '',
    onSymbolPick,
}: Readonly<{
    onSymbolPick: ({ symbol }: { symbol: string }) => void
    symbol?: string
}>) {
    const { baseUrl } = useConfig()
    const [showPicker, setShowPicker] = useState(false)

    return (
        <>
            <button
                type="button"
                onClick={() => setShowPicker(true)}
                className={classes.container}
                data-test="symbolpicker-trigger"
                aria-expanded={showPicker}
                aria-haspopup="dialog"
                aria-label={
                    symbol
                        ? `${i18n.t('Symbol')}: ${symbol}`
                        : i18n.t('Symbol: none selected', {
                              nsSeparator: '~:~',
                          })
                }
            >
                <span className={classes.label}>{i18n.t('Symbol')}</span>
                <span className={classes.symbolSwatch}>
                    {symbol ? (
                        <img
                            className={classes.swatchImage}
                            alt={symbol}
                            src={getSymbolUrl(baseUrl, symbol)}
                        />
                    ) : (
                        <EmptySwatchIcon className={classes.emptyIcon} />
                    )}
                </span>
                <span
                    className={classes.openCloseIconContainer}
                    aria-hidden="true"
                >
                    {showPicker ? <IconChevronUp16 /> : <IconChevronDown16 />}
                </span>
            </button>

            {showPicker && (
                <SymbolPickerModal
                    selected={symbol}
                    onCancel={() => setShowPicker(false)}
                    onChange={({ symbol }) => {
                        onSymbolPick({ symbol })
                        setShowPicker(false)
                    }}
                />
            )}
        </>
    )
}
