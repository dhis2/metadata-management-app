import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function useLabelValidator(property: string) {
    const schemaSection = useSchemaSectionHandleOrThrow()
    return useValidator({ schemaSection, property })
}
