import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import memoize from 'lodash/memoize'
import { useCallback, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function useIsIconKeyUnique() {
    const engine = useDataEngine()

    const memoized = useMemo(
        () =>
            memoize(async (value?: string) => {
                if (!value) {
                    return undefined
                }
                try {
                    await engine.query({
                        result: { resource: 'icons', id: value },
                    })
                    return i18n.t('An icon with this key already exists')
                } catch {
                    return undefined
                }
            }),
        [engine]
    )

    const validate = useCallback(
        (value?: string) => memoized(value),
        [memoized]
    )

    return useDebouncedCallback(validate, 300, { leading: true })
}
