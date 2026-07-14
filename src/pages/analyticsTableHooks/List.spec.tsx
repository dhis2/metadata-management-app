import schemaMock from '../../__mocks__/schema/analyticsTableHooksSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testAnalyticsTableHook } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.analyticsTableHook
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testAnalyticsTableHook
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
