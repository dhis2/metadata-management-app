import { z } from 'zod'

export const errorReportSchema = z.object({
    args: z.array(z.string()).optional(),
    errorCode: z.string(),
    errorKlass: z.string().optional(),
    errorProperties: z.array(z.any()),
    errorProperty: z.string().optional(),
    mainId: z.string().optional(),
    mainKlass: z.string().optional(),
    message: z.string().optional(),
    value: z.any(),
})
export type ErrorReport = z.infer<typeof errorReportSchema>

export const objectReportWebMessageResponseSchema = z
    .object({
        errorReports: z.array(errorReportSchema),
        klass: z.string(),
        responseType: z.union([
            z.literal('ObjectReportWebMessageResponse'),
            z.literal('ObjectReport'),
        ]),
        uid: z.string(),
    })
    .strict()

export const errorMessageSchema = z.object({
    args: z.array(z.string()).optional(),
    errorCode: z.string(),
    message: z.string().optional(),
})
export type ErrorMessage = z.infer<typeof errorMessageSchema>

export const mergeTypeSchema = z.enum([
    'ORG_UNIT',
    'INDICATOR_TYPE',
    'INDICATOR',
    'DATA_ELEMENT',
])

export const mergeReportSchema = z.object({
    mergeErrors: z.array(errorMessageSchema).optional(),
    mergeType: mergeTypeSchema,
    message: z.string().optional(),
    sourcesDeleted: z.array(z.string()).optional(),
})

export const mergeWebResponseSchema = z
    .object({
        mergeReport: mergeReportSchema.optional(),
        responseType: z.literal('MergeWebResponse'),
    })
    .strict()

export const statusSchema = z.enum(['OK', 'WARNING', 'ERROR'])
export const webMessageSchema = z.object({
    code: z.number().int().optional(),
    devMessage: z.string().optional(),
    errorCode: z.string().optional(),
    httpStatus: z.string().optional(),
    httpStatusCode: z.number().int(),
    message: z.string().optional(),
    response: z.union([
        // these are all schemas from OpenAPI, however most of them
        // are not used in maintenane app
        objectReportWebMessageResponseSchema,
        mergeWebResponseSchema,
        // z.lazy(() => apiTokenCreationResponseSchema),
        // z.lazy(() => errorReportsWebMessageResponseSchema),
        // z.lazy(() => fileResourceWebMessageResponseSchema),
        // z.lazy(() => flattenedDataIntegrityReportSchema),
        // z.lazy(() => geoJsonImportReportSchema),
        // z.lazy(() => importCountWebMessageResponseSchema),
        // z.lazy(() => importReportWebMessageResponseSchema),
        // z.lazy(() => importSummariesSchema),
        // z.lazy(() => importSummarySchema),
        // z.lazy(() => importTypeSummarySchema),
        // z.lazy(() => jobConfigurationWebMessageResponseSchema),
        // z.lazy(() => metadataSyncSummarySchema),
        // z.lazy(() => predictionSummarySchema),
        // z.lazy(() => softwareUpdateResponseSchema),
        // z.lazy(() => trackerJobWebMessageResponseSchema),
        // z.lazy(() => trackerJobWebMessageResponseSchema),
    ]),
    status: statusSchema,
})

export type Response = z.infer<typeof webMessageSchema>['response']

export type ResponseType = z.infer<
    typeof webMessageSchema
>['response']['responseType']
