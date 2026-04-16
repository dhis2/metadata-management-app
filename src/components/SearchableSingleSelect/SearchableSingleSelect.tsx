import i18n from '@dhis2/d2-i18n'
import {
    CircularLoader,
    Input,
    SingleSelect,
    SingleSelectOption,
} from '@dhis2/ui'
import React, { forwardRef, useEffect, useState } from 'react'
import { useDebouncedState } from '../../lib'
import classes from './SearchableSingleSelect.module.css'

export interface Option {
    value: string
    label: string
    disabled?: boolean
}

const Loader = forwardRef<HTMLDivElement, object>(function Loader(_, ref) {
    return (
        <div ref={ref} className={classes.loader}>
            <CircularLoader />
        </div>
    )
})

function Error({
    msg,
    onRetryClick,
}: {
    msg: string
    onRetryClick: () => void
}) {
    return (
        <div className={classes.error}>
            <div className={classes.errorInnerWrapper}>
                <span className={classes.loadingErrorLabel}>{msg}</span>
                <button
                    className={classes.errorRetryButton}
                    type="button"
                    onClick={onRetryClick}
                >
                    {i18n.t('Retry')}
                </button>
            </div>
        </div>
    )
}

type OnChange = ({ selected }: { selected: string }) => void
type OnFilterChange = ({ value }: { value: string }) => void
export interface SearchableSingleSelectPropTypes {
    onChange: OnChange
    onFilterChange?: OnFilterChange
    onEndReached?: () => void
    onRetryClick: () => void
    dense?: boolean
    options: Option[]
    placeholder?: string
    prefix?: string
    showEndLoader: boolean
    loading: boolean
    disabled?: boolean
    selected?: string
    invalid?: boolean
    error?: string
    showAllOption?: boolean
    onBlur?: () => void
    onFocus?: () => void
    searchable?: boolean
    noMatchWithoutFilterText?: string
    dataTest?: string
    clearable?: boolean
    clearText?: string
}

export const SearchableSingleSelect = ({
    invalid,
    disabled,
    error,
    dense,
    loading,
    placeholder,
    prefix,
    onBlur,
    onChange,
    onEndReached,
    onFilterChange,
    onFocus,
    onRetryClick,
    options,
    selected,
    showAllOption,
    showEndLoader,
    searchable = true,
    noMatchWithoutFilterText,
    dataTest,
    clearable,
    clearText,
}: SearchableSingleSelectPropTypes) => {
    const [loadingSpinnerRef, setLoadingSpinnerRef] = useState<HTMLElement>()

    const { liveValue: filter, setValue: setFilterValue } =
        useDebouncedState<string>({
            initialValue: '',
            onSetDebouncedValue: (value: string) => onFilterChange?.({ value }),
        })

    useEffect(() => {
        // We don't want to wait for intersections when loading as that can
        // cause buggy behavior
        if (loadingSpinnerRef && !loading) {
            const observer = new IntersectionObserver(
                (entries) => {
                    const [{ isIntersecting }] = entries

                    if (isIntersecting) {
                        onEndReached?.()
                    }
                },
                { threshold: 0.8 }
            )

            observer.observe(loadingSpinnerRef)
            return () => observer.disconnect()
        }
    }, [loadingSpinnerRef, loading, onEndReached])

    const hasSelectedInOptionList = !!options.find(
        ({ value }) => value === selected
    )

    const withAllOptions = showAllOption
        ? [{ value: '', label: i18n.t('All') }, ...options]
        : options

    return (
        <SingleSelect
            // Initially we potentially have a selected value, but we might not have
            // fetched the corresponding label yet. Therefore we don't want to pass in
            // any value to the "selected" prop, as otherwise an error will be thrown
            selected={hasSelectedInOptionList ? selected : ''}
            disabled={disabled}
            error={invalid}
            onChange={onChange}
            placeholder={placeholder}
            prefix={prefix}
            onBlur={onBlur}
            onFocus={onFocus}
            dense={dense}
            dataTest={dataTest}
            clearable={clearable}
            clearText={clearText}
        >
            {searchable && (
                <div className={classes.searchField}>
                    <div
                        className={classes.searchInput}
                        id="single-select-search-input"
                    >
                        <Input
                            dense
                            initialFocus
                            value={filter}
                            onChange={({ value }) =>
                                setFilterValue(value ?? '')
                            }
                            placeholder={i18n.t('Filter options')}
                            type="search"
                        />
                    </div>
                </div>
            )}

            {withAllOptions.length === 0 && (
                <div className={classes.noMatchBlock}>
                    {!filter && noMatchWithoutFilterText
                        ? noMatchWithoutFilterText
                        : 'No matches'}
                </div>
            )}

            {withAllOptions.map(({ value, label, disabled }) => (
                <SingleSelectOption
                    key={value}
                    value={value}
                    label={label}
                    disabled={disabled}
                />
            ))}

            {!error && !loading && showEndLoader && (
                <Loader
                    ref={(ref) => {
                        if (!!ref && ref !== loadingSpinnerRef) {
                            setLoadingSpinnerRef(ref)
                        }
                    }}
                />
            )}

            {!error && loading && <Loader />}

            {error && <Error msg={error} onRetryClick={onRetryClick} />}
        </SingleSelect>
    )
}
