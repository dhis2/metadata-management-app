// Some of the generated models are wrong, or outdated
// The import summaries and error reports changed in 2.41
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

export type ErrorReport = {
    errorCode: string
    errorProperties: string[]
    errorKlass: string
    mainKlass: string
    message: string
    args: string[]
}
