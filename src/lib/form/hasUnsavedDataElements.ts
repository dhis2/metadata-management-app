type DataItemWithDataElement = {
    dataElement: { id: string }
}

export const hasUnsavedDataElements = (
    currentItems: DataItemWithDataElement[] | undefined,
    initialItems: DataItemWithDataElement[] | undefined
): boolean => {
    const current = currentItems ?? []
    const initial = initialItems ?? []

    if (!current.length && !initial.length) {
        return false
    }

    const initialIds = new Set(initial.map((item) => item.dataElement.id))
    const currentIds = new Set(current.map((item) => item.dataElement.id))

    const hasAdditions = current.some(
        (item) => !initialIds.has(item.dataElement.id)
    )
    const hasRemovals = initial.some(
        (item) => !currentIds.has(item.dataElement.id)
    )

    return hasAdditions || hasRemovals
}
