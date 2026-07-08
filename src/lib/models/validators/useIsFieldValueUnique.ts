import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import memoize from 'lodash/memoize'
import { useCallback, useMemo, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface QueryResponse {
    result: Record<string, Array<Record<string, unknown>>>
}

// eq/ieq can't match stored values with padding, so widen to a substring
// match and confirm the real duplicate by trimming candidates client-side
const MATCH_CANDIDATES_PAGE_SIZE = 10

export function useIsFieldValueUnique({
    model,
    field,
    id,
    customFilter,
    message,
    caseSensitive = false,
}: {
    model: string
    field: string
    id?: string
    customFilter?: string
    message?: string
    caseSensitive?: boolean
}) {
    const [HAS_FIELD_VALUE_QUERY] = useState({
        result: {
            resource: model,
            params: (variables: Record<string, string>) => {
                const trimmed = variables.value.trim()
                const isNumeric = !Number.isNaN(Number(trimmed))
                const useCaseSensitiveMatch = isNumeric || caseSensitive
                const matchOperation = useCaseSensitiveMatch ? 'like' : 'ilike'
                const filter = [
                    `${variables.field}:${matchOperation}:${trimmed}`,
                ]

                if (variables.id) {
                    filter.push(`id:ne:${variables.id}`)
                }
                if (variables.customFilter) {
                    filter.push(variables.customFilter)
                }

                return {
                    pageSize: MATCH_CANDIDATES_PAGE_SIZE,
                    fields: `id,${variables.field}`,
                    filter,
                }
            },
        },
    })
    const engine = useDataEngine()

    const memoized = useMemo(
        () =>
            memoize(async (value?: string) => {
                if (!value) {
                    return undefined
                }

                const trimmed = value.trim()
                const data = (await engine.query(HAS_FIELD_VALUE_QUERY, {
                    variables: { field, value, id, customFilter },
                })) as unknown as QueryResponse

                const hasDuplicate = data.result[model].some((object) => {
                    const candidate = object[field]
                    if (typeof candidate !== 'string') {
                        return false
                    }
                    return caseSensitive
                        ? candidate.trim() === trimmed
                        : candidate.trim().toLowerCase() ===
                              trimmed.toLowerCase()
                })

                if (hasDuplicate) {
                    return (
                        message ??
                        i18n.t(
                            'This field requires a unique value, please choose another one'
                        )
                    )
                }
            }),
        [
            model,
            field,
            engine,
            id,
            HAS_FIELD_VALUE_QUERY,
            message,
            customFilter,
            caseSensitive,
        ]
    )

    // Doing it this way to prevent extra arguments to be passed.
    // The "allValues" argument changes for every changed value and therefore
    // circumvents memoization
    const validate = useCallback(
        (value?: string) => memoized(value),
        [memoized]
    )

    return useDebouncedCallback(validate, 50, { leading: true })
}
