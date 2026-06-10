import type { Access, BaseIdentifiableObject } from '../../types/generated'

export const hasWriteAccess = (access: Partial<Access>) => !!access.write
export const hasDeleteAccess = (access: Partial<Access>) => !!access.delete

export const canEditModel = (model: Pick<BaseIdentifiableObject, 'access'>) =>
    hasWriteAccess(model.access)

export const canDeleteModel = (model: Pick<BaseIdentifiableObject, 'access'>) =>
    hasDeleteAccess(model.access)

export type ParsedAccessPart = {
    read: boolean
    write: boolean
}
export type ParsedAccess = {
    metadata: ParsedAccessPart
    data: ParsedAccessPart
}

const parseAccessPart = (accessPart: string): ParsedAccessPart => {
    const canRead = accessPart[0] === 'r'
    return {
        read: canRead,
        write: canRead && accessPart[1] === 'w',
    }
}

// metadata is first part, data second, rest (other) parts are not used
// eg. rw------ = metadata: rw, data: --
const publicAccessRegex = /^(r-|rw|--)(r-|rw|--)(-){4}$/

export const parseAccessString = (
    accessString: string
): ParsedAccess | null => {
    const matches = accessString.match(publicAccessRegex)
    if (!matches) {
        return null
    }
    const [, metadata, data] = matches

    return {
        metadata: parseAccessPart(metadata),
        data: parseAccessPart(data),
    }
}

const accessPartToString = (accessPart: ParsedAccessPart): string => {
    if (accessPart.write) {
        return 'rw'
    }
    return accessPart.read ? 'r-' : '--'
}

export const formatAccessToString = (publicAccess: ParsedAccess): string => {
    const metadata = accessPartToString(publicAccess.metadata)
    const data = accessPartToString(publicAccess.data)

    return metadata + data + '----'
}

export type SharingSettings = {
    owner?: string
    external?: boolean
    public?: string
    userGroups?: Record<
        string,
        { id: string; access: string; displayName?: string }
    >
    users?: Record<string, { id: string; access: string; displayName?: string }>
}

const normalizeSharingEntities = (
    entities?: Record<
        string,
        { id: string; access: string; displayName?: string }
    >
): Array<{ id: string; access: string }> => {
    if (!entities) {
        return []
    }
    return Object.values(entities)
        .map(({ id, access }) => ({ id, access }))
        .sort((a, b) => a.id.localeCompare(b.id))
}

export const areSharingPropertiesSimilar = (
    sharingA?: SharingSettings,
    sharingB?: SharingSettings
): boolean => {
    if (!sharingA || !sharingB) {
        return false
    }
    if (sharingA.public !== sharingB.public) {
        return false
    }
    if (sharingA.external !== sharingB.external) {
        return false
    }

    const usersA = normalizeSharingEntities(sharingA.users)
    const usersB = normalizeSharingEntities(sharingB.users)
    if (JSON.stringify(usersA) !== JSON.stringify(usersB)) {
        return false
    }

    const groupsA = normalizeSharingEntities(sharingA.userGroups)
    const groupsB = normalizeSharingEntities(sharingB.userGroups)
    return JSON.stringify(groupsA) === JSON.stringify(groupsB)
}
