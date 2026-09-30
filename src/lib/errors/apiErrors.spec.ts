import { FetchError } from '@dhis2/app-runtime'
import { parseErrorResponse } from './apiErrors'

describe('parseErrorResponse', () => {
    it.each(['ObjectReport', 'ObjectReportWebMessageResponse'] as const)(
        'extracts the errorReports message for responseType %s',
        (responseType) => {
            const rejection = new FetchError({
                type: 'unknown',
                message: 'Conflict',
                details: {
                    httpStatus: 'Conflict',
                    httpStatusCode: 409,
                    status: 'WARNING',
                    message:
                        'One or more errors occurred, please see full details in import report.',
                    response: {
                        uid: 'nYMyWES01DB',
                        klass: 'org.hisp.dhis.option.OptionSet',
                        errorReports: [
                            {
                                message:
                                    'Object could not be deleted because it is associated with another object: DataElement',
                                args: [],
                                mainKlass: 'org.hisp.dhis.option.OptionSet',
                                errorCode: 'E4030',
                                errorProperties: [],
                            },
                        ],
                        responseType,
                    },
                },
            })

            const result = parseErrorResponse(rejection)

            expect(result.errors).toHaveLength(1)
            expect(result.errors[0]).toMatchObject({
                errorType: 'errorReport',
                message:
                    'Object could not be deleted because it is associated with another object: DataElement',
            })
        }
    )
})
