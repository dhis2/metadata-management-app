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
    sharing?: Record<string, unknown>
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

// Documents can only be updated with a full PUT, so everything that was loaded
// (e.g. sharing) is sent back, with the form-controlled fields overridden
export const buildResourceDocumentPayload = async (
    dataEngine: ReturnType<typeof useDataEngine>,
    values: ResourceSubmitValues
) => {
    const { resourceType, file, ...rest } = values

    return {
        ...rest,
        code: values.code || undefined,
        ...(resourceType === ResourceType.URL
            ? {
                  type: 'EXTERNAL_URL',
                  external: true,
                  attachment: false,
                  url: values.url?.trim(),
              }
            : {
                  type: 'UPLOAD_FILE',
                  external: false,
                  attachment: !!values.attachment,
                  url: await uploadResourceFile(dataEngine, file as File),
              }),
    }
}
