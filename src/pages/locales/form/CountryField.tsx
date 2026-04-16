import i18n from '@dhis2/d2-i18n'
import { Field } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { useField } from 'react-final-form'
import { Option, SearchableSingleSelect } from '../../../components'
import { useBoundResourceQueryFn } from '../../../lib/query/useBoundQueryFn'
import classes from './CountryField.module.css'

type CountriesResponse = Record<string, string>

export function CountryField() {
    const queryFn = useBoundResourceQueryFn()
    const {
        input: { value, onChange, onBlur },
        meta: { error, touched },
    } = useField<string | undefined>('country')

    const COUNTRIES_QUERY = {
        resource: 'locales/countries',
    }

    const {
        error: queryError,
        data,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: [COUNTRIES_QUERY],
        queryFn: queryFn<CountriesResponse>,
    })

    const [maybeFilteredOptions, setMaybeFilteredOptions] = useState<
        { value: string; label: string }[]
    >([])

    const options = useMemo<Option[]>(() => {
        if (!data) {
            return []
        }
        return Object.entries(data).map(([code, name]) => ({
            value: code,
            label: name,
        }))
    }, [data])

    useEffect(() => {
        setMaybeFilteredOptions(options)
    }, [options])

    const handleFilterChange = ({ value }: { value: string }) => {
        setMaybeFilteredOptions(
            options.filter((o) =>
                o.label.toLowerCase().includes(value.toLowerCase())
            )
        )
    }

    const handleChange = ({ selected }: { selected: string }) => {
        onChange(selected)
        // Manually trigger blur to ensure validation runs
        onBlur()
    }

    return (
        <Field
            name="country"
            dataTest="formfields-country"
            label={i18n.t('Country')}
            required
            error={touched && !!error}
            validationText={(touched && error?.toString()) || ''}
        >
            <div className={classes.selectContainer}>
                <SearchableSingleSelect
                    selected={value || ''}
                    invalid={touched && !!error}
                    error={
                        queryError
                            ? i18n.t('Failed to load countries')
                            : undefined
                    }
                    onChange={handleChange}
                    onBlur={onBlur}
                    options={maybeFilteredOptions}
                    loading={isLoading}
                    onFilterChange={handleFilterChange}
                    onRetryClick={refetch}
                    showEndLoader={false}
                    placeholder={i18n.t('Select a country')}
                    clearable
                    clearText={i18n.t('<No value>')}
                    dataTest="locale-country-field"
                />
            </div>
        </Field>
    )
}
