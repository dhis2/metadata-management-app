import schemaMock from '../../__mocks__/schema/validationNotificationTemplate.json'
import { SECTIONS_MAP } from '../../lib'
import { testValidationNotificationTemplate } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.validationNotificationTemplate
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testValidationNotificationTemplate
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
