const hasUnsavedItems = <TKey extends string>(
    key: TKey,
    currentItems: Array<Record<TKey, { id: string }>> | undefined,
    initialItems: Array<Record<TKey, { id: string }>> | undefined
): boolean => {
    const current = currentItems ?? []
    const initial = initialItems ?? []

    if (!current.length && !initial.length) {
        return false
    }

    const initialIds = new Set(initial.map((item) => item[key].id))
    const currentIds = new Set(current.map((item) => item[key].id))

    const hasAdditions = current.some((item) => !initialIds.has(item[key].id))
    const hasRemovals = initial.some((item) => !currentIds.has(item[key].id))

    return hasAdditions || hasRemovals
}

export const hasUnsavedDataElements = (
    currentItems: Array<{ dataElement: { id: string } }> | undefined,
    initialItems: Array<{ dataElement: { id: string } }> | undefined
): boolean => hasUnsavedItems('dataElement', currentItems, initialItems)

export const hasUnsavedTrackedEntityAttributes = (
    currentItems: Array<{ trackedEntityAttribute: { id: string } }> | undefined,
    initialItems: Array<{ trackedEntityAttribute: { id: string } }> | undefined
): boolean =>
    hasUnsavedItems('trackedEntityAttribute', currentItems, initialItems)
