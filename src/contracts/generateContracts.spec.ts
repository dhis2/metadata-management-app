import { mkdirSync, writeFileSync } from 'node:fs'
import { z, ZodObject, ZodRawShape } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { categoryFormSchema } from '../pages/categories/form'
import { iconFormSchema } from '../pages/icons/form'

const generateContract = <T extends ZodRawShape>({
    method,
    path,
    name,
    expectedSchema,
}: {
    method: string
    path: string
    name: string
    expectedSchema: ZodObject<T>
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
    const schema = zodToJsonSchema(
        (expectedSchema as any).extend({ id: z.string() }),
        {
            name,
            rejectedAdditionalProperties: true as unknown as false,
            $refStrategy: 'none',
        }
    )
    mkdirSync(`contracts/${name}`, { recursive: true })
    writeFileSync(contractPath, JSON.stringify(request, null, 2))
    writeFileSync(
        schemaPath,
        JSON.stringify(schema.definitions?.[name], null, 2)
    )
}

describe('contracts', () => {
    it('should generate get category contracts', () => {
        generateContract({
            method: 'GET',
            path: '/categories/{id}',
            name: 'category',
            expectedSchema: categoryFormSchema,
        })
    })
})

describe('icons', () => {
    it('should generate get icons contracts', () => {
        generateContract({
            method: 'GET',
            path: '/icons/{key}',
            name: 'icon',
            expectedSchema: iconFormSchema,
        })
    })
})
