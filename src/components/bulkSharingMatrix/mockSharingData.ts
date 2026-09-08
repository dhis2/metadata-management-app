import type {
    AccessLevel,
    CellValue,
    SharingEntity,
    SharingMatrixData,
    SharingObject,
} from './sharingMatrixModel'

/* PROTOTYPE fixtures. Deliberately hostile: in every preset the outliers are
   buried well past the ~8 object columns that fit on screen, so the prototype
   tests whether you can actually *find* an inconsistency rather than flattering
   itself with a tidy 8-column demo. */

export type MatrixSize = 'small' | 'default' | 'large'

export const MATRIX_SIZES: { value: MatrixSize; label: string }[] = [
    { value: 'small', label: '8 objects · 10 rows' },
    { value: 'default', label: '40 objects · 18 rows' },
    { value: 'large', label: '100 objects · 45 rows' },
]

const OBJECT_BASE_NAMES = [
    'ANC 1st Visit',
    'Child Health',
    'Malaria Weekly',
    'TB Register',
    'HIV Care Monthly',
    'EPI Stock',
    'Facility Assessment',
    'Mortality Audit',
    'Nutrition Screening',
    'Family Planning',
    'Outpatient Summary',
    'Inpatient Morbidity',
    'Lab Results',
    'Cold Chain Check',
    'PMTCT Monthly',
    'Community Referral',
    'School Health',
    'Water Quality',
    'Vector Control',
    'Emergency Triage',
]

const GROUP_NAMES = [
    'Administrators',
    'Data Entry Clerks',
    'District Health Officers',
    'EPI Programme Team',
    'HIV Programme Team',
    'Immunization Supervisors',
    'Laboratory Staff',
    'M&E Officers',
    'Malaria Programme Team',
    'National Data Managers',
    'Regional Coordinators',
    'Surveillance Team',
    'TB Programme Team',
    'Training Group',
]

const USER_NAMES = [
    'Achieng Otieno',
    'Bakary Diallo',
    'Chandra Patel',
    'Fatima Nour',
    'Marta Silva',
    'Nils Berg',
    'Priya Raman',
]

const fakeUid = (prefix: string, index: number): string =>
    `${prefix}${String(index).padStart(10, '0')}`.slice(0, 11)

const BASE_PATTERNS: CellValue[] = [
    { metadata: 'edit', data: 'edit' },
    { metadata: 'view', data: 'edit' },
    { metadata: 'view', data: 'view' },
    { metadata: 'view', data: 'none' },
    { metadata: 'none', data: 'none' },
    { metadata: 'edit', data: 'view' },
]

type Preset = {
    objectCount: number
    groupCount: number
    userCount: number
    /** [objectIndex, entityIndex, metadata, data] */
    outliers: [number, number, AccessLevel, AccessLevel][]
}

const PRESETS: Record<MatrixSize, Preset> = {
    small: {
        objectCount: 8,
        groupCount: 6,
        userCount: 3,
        outliers: [
            [5, 0, 'edit', 'view'],
            [5, 3, 'none', 'none'],
        ],
    },
    default: {
        objectCount: 40,
        groupCount: 12,
        userCount: 5,
        outliers: [
            [8, 4, 'edit', 'edit'],
            [8, 11, 'none', 'none'],
            // entity 0 is Public access — "did one of these 40 quietly go
            // public?" is the scenario this whole component exists for, and
            // it is sitting at column 24 where you cannot see it.
            [23, 0, 'edit', 'view'],
            [23, 7, 'none', 'none'],
            [35, 2, 'edit', 'edit'],
            [35, 15, 'edit', 'edit'],
        ],
    },
    large: {
        objectCount: 100,
        groupCount: 38,
        userCount: 6,
        outliers: [
            [8, 4, 'edit', 'edit'],
            [8, 11, 'none', 'none'],
            [23, 0, 'edit', 'view'],
            [23, 7, 'none', 'none'],
            [35, 2, 'edit', 'edit'],
            [35, 15, 'edit', 'edit'],
            [62, 20, 'none', 'none'],
            [87, 31, 'edit', 'edit'],
        ],
    },
}

const buildObjects = (count: number): SharingObject[] =>
    Array.from({ length: count }, (_, index) => {
        const base = OBJECT_BASE_NAMES[index % OBJECT_BASE_NAMES.length]
        const cycle = Math.floor(index / OBJECT_BASE_NAMES.length)
        return {
            id: fakeUid('o', index),
            name: cycle === 0 ? base : `${base} ${cycle + 1}`,
        }
    })

const buildGroupName = (index: number): string =>
    index < GROUP_NAMES.length
        ? GROUP_NAMES[index]
        : `District ${String(index - GROUP_NAMES.length + 1).padStart(
              2,
              '0'
          )} Health Team`

/* Row order per the agreed spec: Public pinned first, then user groups A-Z,
   then users A-Z. */
const buildEntities = (
    groupCount: number,
    userCount: number
): SharingEntity[] => {
    const groups: SharingEntity[] = Array.from(
        { length: groupCount },
        (_, index) => ({
            id: fakeUid('g', index),
            name: buildGroupName(index),
            kind: 'userGroup' as const,
        })
    ).sort((a, b) => a.name.localeCompare(b.name))

    const users: SharingEntity[] = Array.from(
        { length: userCount },
        (_, index) => ({
            id: fakeUid('u', index),
            name: USER_NAMES[index % USER_NAMES.length],
            kind: 'user' as const,
        })
    ).sort((a, b) => a.name.localeCompare(b.name))

    return [
        { id: 'public', name: 'Public access', kind: 'public' },
        ...groups,
        ...users,
    ]
}

export const buildMockMatrix = (size: MatrixSize): SharingMatrixData => {
    const preset = PRESETS[size]
    const objects = buildObjects(preset.objectCount)
    const entities = buildEntities(preset.groupCount, preset.userCount)

    const access: SharingMatrixData['access'] = {}

    entities.forEach((entity, entityIndex) => {
        const pattern =
            entity.kind === 'public'
                ? ({ metadata: 'view', data: 'none' } as CellValue)
                : BASE_PATTERNS[entityIndex % BASE_PATTERNS.length]

        access[entity.id] = {}
        objects.forEach((object) => {
            access[entity.id][object.id] = { ...pattern }
        })
    })

    preset.outliers.forEach(([objectIndex, entityIndex, metadata, data]) => {
        const object = objects[objectIndex]
        const entity = entities[entityIndex]
        if (object && entity) {
            access[entity.id][object.id] = { metadata, data }
        }
    })

    return { objects, entities, access, dataShareable: true }
}

/** Candidates for the "Add user or group" row. */
export const buildAddCandidates = (
    existing: SharingEntity[]
): SharingEntity[] => {
    const takenNames = new Set(existing.map((entity) => entity.name))

    const groups = GROUP_NAMES.map((name, index) => ({
        id: fakeUid('x', index),
        name,
        kind: 'userGroup' as const,
    }))
    const users = USER_NAMES.map((name, index) => ({
        id: fakeUid('y', index),
        name,
        kind: 'user' as const,
    }))

    return [...groups, ...users].filter(
        (entity) => !takenNames.has(entity.name)
    )
}
