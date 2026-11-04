type CollectionRef = { id: string }

/** Compare unordered owner collections and send only changed IDs. */
export const computeCollectionDiff = (
    initial: readonly CollectionRef[],
    current: readonly CollectionRef[]
) => {
    const initialIds = new Set(initial.map(({ id }) => id))
    const currentIds = new Set(current.map(({ id }) => id))
    const additions: CollectionRef[] = []
    const deletions: CollectionRef[] = []

    for (const id of currentIds) {
        if (!initialIds.has(id)) {
            additions.push({ id })
        }
    }
    for (const id of initialIds) {
        if (!currentIds.has(id)) {
            deletions.push({ id })
        }
    }

    return { additions, deletions }
}
