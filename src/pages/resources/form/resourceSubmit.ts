import { useDataEngine } from '@dhis2/app-runtime'
import { ResourceType } from './resourceSchema'

export type ResourceSubmitValues = {
    id?: string
    name?: string
    code?: string | null
    resourceType?: ResourceType
    url?: string
    attachment?: boolean
    file?: File | null
    attributeValues?: Array<{ attribute: { id: string }; value: string }>
}

const uploadResourceFile = async (
    dataEngine: ReturnType<typeof useDataEngine>,
    file: File
) => {
    const uploadResponse = (await dataEngine.mutate({
        resource: 'fileResources',
        type: 'create',
        data: { file, domain: 'DOCUMENT' },
    })) as { response: { fileResource: { id: string } } }

    return uploadResponse.response.fileResource.id
}

export const buildResourceDocumentPayload = async (
    dataEngine: ReturnType<typeof useDataEngine>,
    values: ResourceSubmitValues
) => ({
    name: values.name,
    code: values.code || undefined,
    attributeValues: values.attributeValues,
    ...(values.resourceType === ResourceType.URL
        ? {
              type: 'EXTERNAL_URL',
              external: true,
              attachment: false,
              url: values.url,
          }
        : {
              type: 'UPLOAD_FILE',
              external: false,
              attachment: !!values.attachment,
              url: await uploadResourceFile(dataEngine, values.file as File),
          }),
})
