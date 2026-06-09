import { useDataQuery } from '@dhis2/app-runtime'
import type { ModelSchemasBase, PickSchemaProperties } from '../types'
import type {
    CurrentUser as CurrentUserBase,
    OrganisationUnit,
    SystemSettings,
} from '../types/models'
import { useSetSchemas } from './schemas'
import {
    useSetSystemOrganisationUnits,
    useSystemOrgUnits,
} from './systemOrgUnits'
import { useSetSystemSettings } from './systemSettings'
import { useSetCurrentUser } from './user'

const schemaFields = [
    'authorities',
    'displayName',
    'name',
    'plural',
    'singular',
    'translatable',
    'properties',
    'shareable',
    'dataShareable',
] as const

// workaround to widen the type, because useQuery() does not allow for
// readonly types (even though it should)
const schemaFieldsFilter = schemaFields.concat()

type SchemaPropertyFields = (typeof schemaFieldsFilter)[number]
export type Schema = PickSchemaProperties<SchemaPropertyFields>
export type ModelSchemas = ModelSchemasBase<Schema>

// same fields as headbar-request to hit the cache
const userFields = [
    'authorities',
    'avatar',
    'email',
    'name',
    'settings',
] as const
// workaround to widen the type, because useQuery() does not allow for
// readonly types
// also add complex field-filters that are not trivial to reuse for types
const orgUnitFields = ['id', 'level', 'path'] as const
const userFieldsFilter = [
    ...userFields,
    `organisationUnits[${orgUnitFields.join(',')}]`,
]
export type UserAssignedOrganisationUnits = Pick<
    OrganisationUnit,
    (typeof orgUnitFields)[number]
>[]
type UserPropertyFields = (typeof userFields)[number]
type CurrentUserResponse = Pick<CurrentUserBase, UserPropertyFields> & {
    organisationUnits: UserAssignedOrganisationUnits
}

/**
 * !!! WARNING !!!
 * There's already a `CurrentUser` type exported from the generated schema
 * types. We need to think about the name of this type, see:
 * https://github.com/dhis2/maintenance-app-beta/pull/359#discussion_r1399267866
 */
export interface CurrentUser extends Omit<CurrentUserResponse, 'authorities'> {
    authorities: Set<string> // use a set for faster lookup
}

const query = {
    schemas: {
        resource: 'schemas',
        params: {
            fields: schemaFieldsFilter,
        },
    },
    currentUser: {
        resource: 'me',
        params: {},
    },
    systemSettings: {
        resource: 'systemSettings',
    },
    organisationUnits: {
        resource: 'organisationUnits',
        fields: orgUnitFields,
        params: {
            fields: 'id,path,level',
            paging: false,
            filter: 'parent:null',
        },
    },
}

// properties are returned as an array, but we map them by fieldName
type SchemaResponse = Omit<Schema, 'properties'> & {
    properties: Schema['properties'][number][]
}

interface QueryResponse {
    schemas: {
        schemas: SchemaResponse[]
    }
    currentUser: CurrentUserResponse
    systemSettings: SystemSettings
    organisationUnits: { organisationUnits: UserAssignedOrganisationUnits }
}

const formatSchema = (schema: SchemaResponse): Schema => {
    const propEntries = schema.properties.map((prop) => [prop.fieldName, prop])
    const mappedProperties = Object.fromEntries(propEntries)
    return {
        ...schema,
        properties: mappedProperties,
    }
}

export const useLoadApp = () => {
    const setSchemas = useSetSchemas()
    const setCurrentUser = useSetCurrentUser()
    const setSystemSettings = useSetSystemSettings()
    const setSystemOrganisationUnits = useSetSystemOrganisationUnits()

    const queryResponse = useDataQuery<QueryResponse>(query, {
        onComplete: (queryData) => {
            try {
                const schemas = queryData.schemas.schemas

                const schemaEntries = schemas.map((schema) => [
                    schema.singular,
                    formatSchema(schema),
                ])
                const modelSchemas: ModelSchemas =
                    Object.fromEntries(schemaEntries)
                const currentUserResponse = queryData.currentUser
                const currentUser: CurrentUser = {
                    ...currentUserResponse,
                    authorities: new Set(currentUserResponse.authorities),
                }
                setSchemas(modelSchemas)
                setCurrentUser(currentUser)
                setSystemSettings(queryData.systemSettings)
                setSystemOrganisationUnits(
                    queryData?.organisationUnits?.organisationUnits ?? []
                )
            } catch (e) {
                console.log('Failed to load app', e)
            }
        },
    })
    return queryResponse
}
