import schemaMock from '../../__mocks__/schema/trackedEntityTypes.json'
import { SECTIONS_MAP } from '../../lib'
import { testTrackedEntityType } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.trackedEntityType
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testTrackedEntityType
const customData = {}

jest.retryTimes(2, { logErrorsBeforeRetry: true })

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
