import { useCallback, useMemo, useState } from 'react'
import { buildMockMatrix, type MatrixSize } from './mockSharingData'
import {
    ACCESS_LEVELS,
    aggregateLevels,
    buildPatches,
    editKey,
    getCellDiff,
    type AccessAxis,
    type AxisDiff,
    type AccessLevel,
    type CellValue,
    type EditKey,
    type ObjectPatch,
    type ObjectSummary,
    type RowAggregate,
    type SharingEntity,
} from './sharingMatrixModel'

const NONE_VALUE: CellValue = { metadata: 'none', data: 'none' }

type LevelUpdate = {
    entityId: string
    objectId: string
    axis: AccessAxis
    level: AccessLevel
}

const sortEntities = (entities: SharingEntity[]): SharingEntity[] => {
    const byKind = (kind: SharingEntity['kind']) =>
        entities
            .filter((entity) => entity.kind === kind)
            .sort((a, b) => a.name.localeCompare(b.name))

    return [
        ...entities.filter((entity) => entity.kind === 'public'),
        ...byKind('userGroup'),
        ...byKind('user'),
    ]
}

export const useSharingMatrix = (size: MatrixSize) => {
    const data = useMemo(() => buildMockMatrix(size), [size])
    const [addedEntityIds, setAddedEntityIds] = useState<string[]>([])
    const [addedEntities, setAddedEntities] = useState<SharingEntity[]>([])
    const [edits, setEdits] = useState<Record<EditKey, AccessLevel>>({})

    const existingEntities = useMemo(
        () => sortEntities(data.entities),
        [data.entities]
    )
    const entities = useMemo(
        () => [...existingEntities, ...addedEntities],
        [existingEntities, addedEntities]
    )
    const objects = data.objects

    const getOriginal = useCallback(
        (entityId: string, objectId: string): CellValue =>
            data.access[entityId]?.[objectId] ?? NONE_VALUE,
        [data.access]
    )

    const getValue = useCallback(
        (entityId: string, objectId: string): CellValue => {
            const original = getOriginal(entityId, objectId)
            return {
                metadata:
                    edits[editKey(entityId, objectId, 'metadata')] ??
                    original.metadata,
                data:
                    edits[editKey(entityId, objectId, 'data')] ?? original.data,
            }
        },
        [edits, getOriginal]
    )

    /* An edit that returns a cell to its loaded value is deleted rather than
       stored, so `touched` never drifts from "actually differs". Everything
       downstream — the diff colours, the footer count, the patch — reads this
       one fact. */
    const applyUpdates = useCallback(
        (updates: LevelUpdate[]) => {
            setEdits((previous) => {
                const next = { ...previous }
                updates.forEach(({ entityId, objectId, axis, level }) => {
                    const key = editKey(entityId, objectId, axis)
                    if (getOriginal(entityId, objectId)[axis] === level) {
                        delete next[key]
                    } else {
                        next[key] = level
                    }
                })
                return next
            })
        },
        [getOriginal]
    )

    const setCell = useCallback(
        (
            entityId: string,
            objectId: string,
            axis: AccessAxis,
            level: AccessLevel
        ) => applyUpdates([{ entityId, objectId, axis, level }]),
        [applyUpdates]
    )

    const setRowAxis = useCallback(
        (entityId: string, axis: AccessAxis, level: AccessLevel) =>
            applyUpdates(
                objects.map((object) => ({
                    entityId,
                    objectId: object.id,
                    axis,
                    level,
                }))
            ),
        [applyUpdates, objects]
    )

    const removeRow = useCallback(
        (entityId: string) =>
            applyUpdates(
                objects.flatMap((object) =>
                    (['metadata', 'data'] as AccessAxis[]).map((axis) => ({
                        entityId,
                        objectId: object.id,
                        axis,
                        level: 'none' as AccessLevel,
                    }))
                )
            ),
        [applyUpdates, objects]
    )

    const setColumnAxis = useCallback(
        (objectId: string, axis: AccessAxis, level: AccessLevel) =>
            applyUpdates(
                entities.map((entity) => ({
                    entityId: entity.id,
                    objectId,
                    axis,
                    level,
                }))
            ),
        [applyUpdates, entities]
    )

    const clearColumn = useCallback(
        (objectId: string) =>
            applyUpdates(
                entities.flatMap((entity) =>
                    (['metadata', 'data'] as AccessAxis[]).map((axis) => ({
                        entityId: entity.id,
                        objectId,
                        axis,
                        level: 'none' as AccessLevel,
                    }))
                )
            ),
        [applyUpdates, entities]
    )

    /** The operation only a matrix can offer: "this one is right, make the
        others match it." Reads the source column's *current* values, so it
        propagates edits you just made as happily as loaded state. */
    const copyColumnToAll = useCallback(
        (sourceObjectId: string) => {
            const updates: LevelUpdate[] = []
            entities.forEach((entity) => {
                const source = getValue(entity.id, sourceObjectId)
                objects.forEach((object) => {
                    if (object.id === sourceObjectId) {
                        return
                    }
                    updates.push({
                        entityId: entity.id,
                        objectId: object.id,
                        axis: 'metadata',
                        level: source.metadata,
                    })
                    updates.push({
                        entityId: entity.id,
                        objectId: object.id,
                        axis: 'data',
                        level: source.data,
                    })
                })
            })
            applyUpdates(updates)
        },
        [applyUpdates, entities, objects, getValue]
    )

    const revertRow = useCallback((entityId: string) => {
        setEdits((previous) =>
            Object.fromEntries(
                Object.entries(previous).filter(
                    ([key]) => !key.startsWith(`${entityId}|`)
                )
            )
        )
    }, [])

    const discardAll = useCallback(() => setEdits({}), [])

    const addEntity = useCallback((entity: SharingEntity) => {
        setAddedEntities((previous) =>
            previous.some((existing) => existing.id === entity.id)
                ? previous
                : [...previous, entity]
        )
        setAddedEntityIds((previous) => [...previous, entity.id])
    }, [])

    const isRowTouched = useCallback(
        (entityId: string) =>
            Object.keys(edits).some((key) => key.startsWith(`${entityId}|`)),
        [edits]
    )

    const getRowAggregate = useCallback(
        (entityId: string, axis: AccessAxis): RowAggregate =>
            aggregateLevels(
                objects.map((object) => getValue(entityId, object.id)[axis])
            ),
        [objects, getValue]
    )

    /* The summary view has no per-object cells to colour, so the aggregate has
       to carry the diff itself. A row-axis can move both ways at once — set a
       mixed row to "View only" and some objects gain while others lose. */
    const getRowAxisDiff = useCallback(
        (entityId: string, axis: AccessAxis): AxisDiff => {
            let added = false
            let removed = false
            objects.forEach((object) => {
                const diff = getCellDiff(
                    getOriginal(entityId, object.id)[axis],
                    getValue(entityId, object.id)[axis]
                )
                if (diff === 'added') {
                    added = true
                } else if (diff === 'removed') {
                    removed = true
                }
            })
            if (added && removed) {
                return 'both'
            }
            if (added) {
                return 'added'
            }
            return removed ? 'removed' : 'unchanged'
        },
        [objects, getOriginal, getValue]
    )

    /* Everything the by-object overview needs, in one pass: the level
       composition per axis, and how many other objects share this exact
       configuration. Grouping has to see every object at once, so it cannot
       live in a per-row helper. */
    const objectSummaries = useMemo(() => {
        const patternKey = (objectId: string) =>
            entities
                .map((entity) => {
                    const value = getValue(entity.id, objectId)
                    return `${entity.id}:${value.metadata}${value.data}`
                })
                .join('|')

        const keys = new Map<string, string>()
        const sizes = new Map<string, number>()
        objects.forEach((object) => {
            const key = patternKey(object.id)
            keys.set(object.id, key)
            sizes.set(key, (sizes.get(key) ?? 0) + 1)
        })
        const largest = Math.max(0, ...sizes.values())

        const summaries = new Map<string, ObjectSummary>()
        objects.forEach((object) => {
            const patternSize = sizes.get(keys.get(object.id) as string) ?? 1
            const counts = {} as ObjectSummary['counts']

            ;(['metadata', 'data'] as AccessAxis[]).forEach((axis) => {
                const tally: Record<AccessLevel, number> = {
                    none: 0,
                    view: 0,
                    edit: 0,
                }
                entities.forEach((entity) => {
                    tally[getValue(entity.id, object.id)[axis]] += 1
                })
                counts[axis] = ACCESS_LEVELS.filter(
                    (level) => tally[level] > 0
                ).map((level) => ({ level, count: tally[level] }))
            })

            summaries.set(object.id, {
                counts,
                patternSize,
                // when every object is unique there is no majority to be
                // consistent with, so nothing gets the flag
                consistent: patternSize === largest && largest > 1,
            })
        })
        return summaries
    }, [objects, entities, getValue])

    const getObjectSummary = useCallback(
        (objectId: string): ObjectSummary =>
            objectSummaries.get(objectId) ?? {
                counts: { metadata: [], data: [] },
                patternSize: 1,
                consistent: false,
            },
        [objectSummaries]
    )

    const changeSummary = useMemo(() => {
        const touchedObjectIds = new Set(
            Object.keys(edits).map((key) => key.split('|')[1])
        )
        return {
            edits: Object.keys(edits).length,
            objects: touchedObjectIds.size,
        }
    }, [edits])

    const patches = useMemo<ObjectPatch[]>(
        () =>
            buildPatches({
                entities,
                objects,
                getValue,
                isRowObjectTouched: (entityId, objectId) =>
                    !!edits[editKey(entityId, objectId, 'metadata')] ||
                    !!edits[editKey(entityId, objectId, 'data')],
            }),
        [entities, objects, getValue, edits]
    )

    return {
        objects,
        entities,
        dataShareable: data.dataShareable,
        addedEntityIds,
        getOriginal,
        getValue,
        getRowAggregate,
        getRowAxisDiff,
        getObjectSummary,
        isRowTouched,
        changeSummary,
        patches,
        setCell,
        setRowAxis,
        removeRow,
        setColumnAxis,
        clearColumn,
        copyColumnToAll,
        revertRow,
        discardAll,
        addEntity,
    }
}

export type SharingMatrixApi = ReturnType<typeof useSharingMatrix>
