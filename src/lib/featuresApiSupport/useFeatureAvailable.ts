import { useConfig } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { hasAPISupportForFeature } from './support'

export const useFeatureAvailable = (featureName: string): boolean => {
    const {
        serverVersion: { minor: minorVersion, patch: patchVersion } = {
            minor: 0,
            patch: 0,
        },
    } = useConfig()
    return useMemo(
        () =>
            hasAPISupportForFeature({
                minorVersion,
                featureName,
                patchVersion,
            }),
        [minorVersion, featureName]
    )
}
