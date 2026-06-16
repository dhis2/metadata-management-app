import { create } from 'zustand'

type OrganisationUnit = {
    id: string
    path: string
    level: number
}
export interface SystemOrgUnitsStore {
    organisationUnits: OrganisationUnit[] | undefined
    setOrganisationUnits: (organisationUnits: OrganisationUnit[]) => void
    getRootOrganisationUnits: () => OrganisationUnit[]
}

export const useSystemOrgUnitsStore = create<SystemOrgUnitsStore>()(
    (set, get) => ({
        organisationUnits: undefined,
        setOrganisationUnits: (organisationUnits: OrganisationUnit[]) =>
            set({ organisationUnits }),
        getRootOrganisationUnits: () => {
            const organisationUnits = get().organisationUnits
            if (organisationUnits === undefined) {
                return []
            }
            return organisationUnits
        },
    })
)

export const useSetSystemOrganisationUnits = () =>
    useSystemOrgUnitsStore((state) => state.setOrganisationUnits)

export const useSystemOrgUnits = () =>
    useSystemOrgUnitsStore((state) => state.getRootOrganisationUnits())
