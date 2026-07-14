import schemaMock from '../../__mocks__/schema/trackedEntityAttributes.json'
import { SECTIONS_MAP } from '../../lib'
import { testTrackedEntityAttribute } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.trackedEntityAttribute
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testTrackedEntityAttribute
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
