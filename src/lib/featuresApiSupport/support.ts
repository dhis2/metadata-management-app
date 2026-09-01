export const FEATURES = Object.freeze({
    searchPerformance: 'searchPerformance',
    validationStrategy: 'validationStrategy',
    programRuleActionPriority: 'programRuleActionPriority',
    skipAnalytics: 'skipAnalytics',
    customTerminologyPlurals: 'customTerminologyPlurals',
} as const)

const VERSION_SUPPORT = Object.freeze({
    [FEATURES.searchPerformance]: { minor: 43 },
    [FEATURES.validationStrategy]: { minor: 42 },
    [FEATURES.programRuleActionPriority]: { minor: 43 },
    [FEATURES.skipAnalytics]: { minor: 43 },
    [FEATURES.customTerminologyPlurals]: { minor: 43, patch: 2 },
} as Record<string, { minor: number; patch?: number }>)

export const hasAPISupportForFeature = ({
    minorVersion,
    featureName,
    patchVersion,
}: {
    minorVersion: string | number
    featureName: string
    patchVersion?: string | number
}): boolean => {
    const requiredMinorVersion = VERSION_SUPPORT[featureName].minor
    const requiredPatchVersion = VERSION_SUPPORT[featureName].patch

    if (requiredPatchVersion !== undefined) {
        return (
            requiredMinorVersion < Number(minorVersion) ||
            (requiredMinorVersion === Number(minorVersion) &&
                requiredPatchVersion <= Number(patchVersion))
        )
    }

    return requiredMinorVersion <= Number(minorVersion) || false
}
