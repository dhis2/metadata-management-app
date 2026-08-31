import type { ErrorReport as GeneratedErrorReport } from './generated'
// The import summary shape returned by the API (httpStatus/response/...) is not
// described by the generated schema, so ImportSummary/ImportResponse stay hand-written.
// ErrorReport below is just narrowed to the fields we use (the generated type now
// includes `args`, so this is no longer a correctness fix).
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
