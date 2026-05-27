import schemaMock from '../../__mocks__/schema/validationRules.json'
import { SECTIONS_MAP } from '../../lib'
import { testValidationRule } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.validationRule
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testValidationRule
const customData = {}

jest.retryTimes(2, { logErrorsBeforeRetry: true })

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
