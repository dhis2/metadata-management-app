import schemaMock from '../../__mocks__/schema/dataElements.json'
import { SECTIONS_MAP } from '../../lib'
import { testDataElement } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.dataElement
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testDataElement
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
