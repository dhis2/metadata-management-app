import { z } from 'zod'

type WrapNonDefaultsInOptional<T extends z.ZodTypeAny> = T extends z.ZodEffects<
    infer Obj
>
    ? WrapNonDefaultsInOptional<Obj>
    : T extends z.ZodObject<infer Shape>
    ? z.ZodObject<{ [K in keyof Shape]: WrapNonDefaultsInOptional<Shape[K]> }>
    : T extends z.ZodDefault<infer Default>
    ? Default
    : z.ZodOptional<T>

type DeepPartial<T> = T extends (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

// inspired by: https://github.com/colinhacks/zod/discussions/1953#discussioncomment-5695528
// added some type-improvements
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDefaults<T extends z.AnyZodObject | z.ZodEffects<any>>(
    schema: T,
    defaults?: DeepPartial<z.input<T>>
): z.infer<WrapNonDefaultsInOptional<T>> {
    // Check if it's a ZodEffect
    if (schema instanceof z.ZodEffects) {
        // Check if it's a recursive ZodEffect
        if (schema.innerType() instanceof z.ZodEffects) {
            return getDefaults(schema.innerType(), defaults)
        }
        // return schema inner shape as a fresh zodObject
        return getDefaults(
            z.ZodObject.create(schema.innerType().shape),
            defaults
        )
    }

    function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
        if (schema instanceof z.ZodOptional) {
            return schema._def.innerType
        }
        if (schema instanceof z.ZodNullable) {
            return schema._def.innerType
        }
        if (schema instanceof z.ZodDefault) {
            return schema._def.innerType
        }
        if (schema instanceof z.ZodCatch) {
            return schema._def.innerType
        }
        if (schema instanceof z.ZodEffects) {
            return schema._def.schema
        }
        return schema
    }

    function getDefaultValue(
        innerSchema: z.ZodTypeAny,
        providedValue: unknown
    ): unknown {
        // use provided default if exists
        if (providedValue !== undefined) {
            if (
                innerSchema instanceof z.ZodObject &&
                typeof providedValue === 'object' &&
                providedValue !== null
            ) {
                // if user passed {}, keep it as {} and do not expand children
                if (Object.keys(providedValue as object).length === 0) {
                    return {}
                }
                return getDefaults(innerSchema, providedValue)
            }
            return providedValue
        }

        // if it's optional/nullable and nothing was provided, it's simply
        // unset - don't drill into the inner type to synthesize a default
        // object/array (e.g. `{ id: undefined }` for an optional model reference)
        if (
            innerSchema instanceof z.ZodOptional ||
            innerSchema instanceof z.ZodNullable
        ) {
            return undefined
        }

        const unwrapped = unwrap(innerSchema)
        if (unwrapped !== innerSchema) {
            return getDefaultValue(unwrapped, providedValue)
        }

        // array default
        if (innerSchema instanceof z.ZodArray) {
            return []
        }

        // object default
        if (innerSchema instanceof z.ZodObject) {
            return getDefaults(innerSchema, {})
        }
        return undefined
    }

    return Object.fromEntries(
        Object.entries(schema.shape).map(([key, value]) => {
            const provided = defaults?.[key as keyof z.input<T>]
            return [key, getDefaultValue(value as z.ZodTypeAny, provided)]
        })
    )
}

// inspired by: https://github.com/colinhacks/zod/discussions/1953#discussioncomment-5695528
// added some type-improvements
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDefaultsOld<T extends z.AnyZodObject | z.ZodEffects<any>>(
    schema: T
): z.infer<WrapNonDefaultsInOptional<T>> {
    // Check if it's a ZodEffect
    if (schema instanceof z.ZodEffects) {
        // Check if it's a recursive ZodEffect
        if (schema.innerType() instanceof z.ZodEffects) {
            return getDefaultsOld(schema.innerType())
        }
        // return schema inner shape as a fresh zodObject
        return getDefaultsOld(z.ZodObject.create(schema.innerType().shape))
    }

    function getDefaultValue(innerSchema: z.ZodTypeAny): unknown {
        if (innerSchema instanceof z.ZodDefault) {
            return innerSchema._def.defaultValue()
        }
        // return an empty array if it is
        if (innerSchema instanceof z.ZodArray) {
            return []
        }
        // return an content of object recursivly
        if (innerSchema instanceof z.ZodObject) {
            return getDefaultsOld(innerSchema)
        }
        if (innerSchema instanceof z.ZodOptional) {
            return undefined
        }
        if (!('innerType' in innerSchema._def)) {
            return undefined
        }
        return getDefaultValue(innerSchema._def.innerType)
    }

    return Object.fromEntries(
        Object.entries(schema.shape).map(([key, value]) => {
            return [key, getDefaultValue(value as z.ZodTypeAny)]
        })
    )
}
