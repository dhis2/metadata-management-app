import i18n from '@dhis2/d2-i18n'
import { formatAccessToString } from '../../lib'

/* PROTOTYPE — see README.md in this folder.
   The access model is deliberately narrow: metadata and data each move along a
   single total order, which is what makes "additive vs removal" well-defined
   per sub-cell. */

export type AccessLevel = 'none' | 'view' | 'edit'
export type AccessAxis = 'metadata' | 'data'

export const ACCESS_LEVELS: AccessLevel[] = ['edit', 'view', 'none']

const ACCESS_RANK: Record<AccessLevel, number> = { none: 0, view: 1, edit: 2 }

export const getLevelLabel = (axis: AccessAxis, level: AccessLevel): string => {
    if (level === 'none') {
        return i18n.t('No access')
    }
    if (level === 'view') {
        return i18n.t('View only')
    }
    return axis === 'data'
        ? i18n.t('Edit and capture')
        : i18n.t('Edit and view')
}

// Used where there is no room for the full label — the aggregate cell. Dense
// grid cells carry no text at all; the chip glyph is the label there.
export const getLevelShortLabel = (
    axis: AccessAxis,
    level: AccessLevel
): string => {
    if (level === 'none') {
        return i18n.t('None')
    }
    if (level === 'view') {
        return i18n.t('View')
    }
    return axis === 'data' ? i18n.t('Capture') : i18n.t('Edit')
}

export type SharingEntityKind = 'public' | 'userGroup' | 'user'

export type SharingEntity = {
    id: string
    name: string
    kind: SharingEntityKind
}

export type SharingObject = {
    id: string
    name: string
}

export type CellValue = {
    metadata: AccessLevel
    data: AccessLevel
}

export type SharingMatrixData = {
    objects: SharingObject[]
    entities: SharingEntity[]
    /** entityId -> objectId -> CellValue */
    access: Record<string, Record<string, CellValue>>
    dataShareable: boolean
}

export type EditKey = string

export const editKey = (
    entityId: string,
    objectId: string,
    axis: AccessAxis
): EditKey => `${entityId}|${objectId}|${axis}`

export type CellDiff = 'unchanged' | 'added' | 'removed'

/** A whole row-axis can move both ways at once, which a single cell cannot. */
export type AxisDiff = CellDiff | 'both'

export const getCellDiff = (
    original: AccessLevel,
    current: AccessLevel
): CellDiff => {
    if (original === current) {
        return 'unchanged'
    }
    return ACCESS_RANK[current] > ACCESS_RANK[original] ? 'added' : 'removed'
}

export type LevelCount = { level: AccessLevel; count: number }

export type RowAggregate = {
    /** true when the objects do not agree; `level` is meaningless then */
    mixed: boolean
    level: AccessLevel
    /** levels actually present, strongest first */
    breakdown: LevelCount[]
    total: number
}

export const aggregateLevels = (levels: AccessLevel[]): RowAggregate => {
    const counts: Record<AccessLevel, number> = { none: 0, view: 0, edit: 0 }
    levels.forEach((level) => {
        counts[level] += 1
    })

    const breakdown = ACCESS_LEVELS.filter((level) => counts[level] > 0).map(
        (level) => ({ level, count: counts[level] })
    )

    return {
        mixed: breakdown.length > 1,
        level: breakdown[0]?.level ?? 'none',
        breakdown,
        total: levels.length,
    }
}

export const describeAggregate = (
    axis: AccessAxis,
    aggregate: RowAggregate
): string =>
    aggregate.breakdown
        .map(
            ({ level, count }) =>
                `${count}/${aggregate.total} ${getLevelLabel(axis, level)}`
        )
        .join(', ')

/* The by-object overview cannot mirror the by-entity one: a fixed entity has
   exactly one level per object, but a fixed object has one level per entity.
   So an object row carries a composition plus a deviation flag, not a level.
   This mirrors the RoleAccess pattern already in the app, where a program
   stage is flagged when its sharing differs from its program's. */
export type ObjectSummary = {
    /** how many entities sit at each level, strongest first, per axis */
    counts: Record<AccessAxis, LevelCount[]>
    /** how many selected objects share this exact configuration */
    patternSize: number
    /** true when this configuration is the most common one in the selection */
    consistent: boolean
}

const LEVEL_TO_ACCESS_PART: Record<
    AccessLevel,
    { read: boolean; write: boolean }
> = {
    none: { read: false, write: false },
    view: { read: true, write: false },
    edit: { read: true, write: true },
}

export const cellValueToAccessString = (value: CellValue): string =>
    formatAccessToString({
        metadata: LEVEL_TO_ACCESS_PART[value.metadata],
        data: LEVEL_TO_ACCESS_PART[value.data],
    })

export type SharingJsonPatchOperation = {
    op: 'add' | 'replace' | 'remove'
    path: string
    value?: unknown
}

export type ObjectPatch = {
    id: string
    name: string
    operations: SharingJsonPatchOperation[]
}

const entityPath = (entity: SharingEntity): string => {
    if (entity.kind === 'public') {
        return '/sharing/public'
    }
    const collection = entity.kind === 'user' ? 'users' : 'userGroups'
    return `/sharing/${collection}/${entity.id}`
}

/**
 * Only touched cells produce operations — that is the whole point of tracking
 * `touched` separately from the access level. An untouched cell is left alone,
 * which is what makes the matrix safe as a partial view of sharing.
 */
export const buildPatches = ({
    entities,
    objects,
    getValue,
    isRowObjectTouched,
}: {
    entities: SharingEntity[]
    objects: SharingObject[]
    getValue: (entityId: string, objectId: string) => CellValue
    isRowObjectTouched: (entityId: string, objectId: string) => boolean
}): ObjectPatch[] =>
    objects
        .map((object) => {
            const operations = entities
                .filter((entity) => isRowObjectTouched(entity.id, object.id))
                .map((entity) => {
                    const value = getValue(entity.id, object.id)
                    const path = entityPath(entity)

                    if (
                        entity.kind !== 'public' &&
                        value.metadata === 'none' &&
                        value.data === 'none'
                    ) {
                        return { op: 'remove', path } as const
                    }

                    const access = cellValueToAccessString(value)
                    return {
                        op: 'replace',
                        path,
                        value:
                            entity.kind === 'public'
                                ? access
                                : { id: entity.id, access },
                    } as const
                })

            return { id: object.id, name: object.name, operations }
        })
        .filter((patch) => patch.operations.length > 0)
