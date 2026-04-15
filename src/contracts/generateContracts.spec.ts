import { mkdirSync, writeFileSync } from 'node:fs'
import { z, ZodObject, ZodRawShape } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { categoryFormSchema } from '../pages/categories/form'
import { indicatorFormSchema } from '../pages/indicators/form/indicatorSchema'

const generateContract = <T extends ZodRawShape>({
    method,
    path,
    name,
    expectedSchema,
    usage,
}: {
    method: string
    path: string
    name: string
    expectedSchema: ZodObject<T>
    usage?: string
}) => {
    const contractPath = `contracts/${name}/contract.json`
    const schemaPath = `contracts/${name}/json-schema.json`
    const request = {
        name,
        httpMethod: method,
        requestUrl: path,
        responseStatus: 200,
        jsonSchema: `contracts/metadata-management-app/${name}/json-schema.json`,
    }
    const schema = zodToJsonSchema(expectedSchema.extend({ id: z.string() }), {
        name,
        // @ts-expect-error - zod-to-json-schema types omit true for rejectedAdditionalProperties
        rejectedAdditionalProperties: true,
        $refStrategy: 'none',
    })
    mkdirSync(`contracts/${name}`, { recursive: true })
    writeFileSync(contractPath, JSON.stringify(request, null, 2))
    writeFileSync(
        schemaPath,
        JSON.stringify(schema.definitions?.[name], null, 2)
    )
    if (usage) {
        writeFileSync(
            `contracts/${name}/README.md`,
            `# ${method} ${name} usage\n\n${usage}`
        )
    }
}

describe('contracts', () => {
    it('should generate get category contracts', () => {
        generateContract({
            method: 'GET',
            path: '/categories/{id}',
            name: 'category',
            expectedSchema: categoryFormSchema,
            usage: 'used to populate edit category form',
        })
    })

    it('should generate get indicator contracts', () => {
        generateContract({
            method: 'GET',
            path: '/indicators/{id}',
            name: 'indicator',
            expectedSchema: indicatorFormSchema,
            usage: 'used to populate edit indicator form',
        })
    })
})
