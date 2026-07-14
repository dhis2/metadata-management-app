import schemaMock from '../../__mocks__/schema/relationshipTypes.json'
import { SECTIONS_MAP } from '../../lib'
import { testRelationshipType } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.relationshipType
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testRelationshipType
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
