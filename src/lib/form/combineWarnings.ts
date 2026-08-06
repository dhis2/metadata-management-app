export function combineWarnings(
    ...warnings: Array<string | undefined>
): string | undefined {
    const sentences = warnings
        .filter((warning): warning is string => !!warning)
        .map((warning) => (/[.!?]$/.test(warning) ? warning : `${warning}.`))

    return sentences.length > 0 ? sentences.join(' ') : undefined
}
