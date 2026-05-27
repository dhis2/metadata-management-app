import schemaMock from '../../__mocks__/schema/dataElementGroups.json'
import { SECTIONS_MAP } from '../../lib'
import {
    testDataElement,
    testDataElementGroup,
    testDataElementGroupSet,
} from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

jest.retryTimes(2, { logErrorsBeforeRetry: true })

const section = SECTIONS_MAP.dataElementGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testDataElementGroup
const customData = {
    dataElements: (type: any, params: any) => {
        if (type === 'read') {
            return {
                dataElements: [
                    testDataElement(),
                    testDataElement(),
                    testDataElement(),
                ],
                pager: { page: 1, total: 3, pageSize: 20, pageCount: 1 },
            }
        }
    },
    dataElementGroupSets: (type: any, params: any) => {
        if (type === 'read') {
            return {
                dataElementGroupSets: [
                    testDataElementGroupSet(),
                    testDataElementGroupSet(),
                ],
                pager: { page: 1, total: 2, pageSize: 20, pageCount: 1 },
            }
        }
    },
}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
