import type { ErrorReport as GeneratedErrorReport } from './generated'

// The import summary response shape is not described by the generated schema.
export type ImportSummary = {
    httpStatus: string
    httpStatusCode: number
    message?: string
    status: string
    response: ImportResponse
}

export type ImportResponse = {
    errorReports: ErrorReport[]
    klass: string
    responseType: string
    uid: string
}

export type ErrorReport = Pick<
    GeneratedErrorReport,
    | 'errorCode'
    | 'errorProperties'
    | 'errorKlass'
    | 'mainKlass'
    | 'message'
    | 'args'
>
