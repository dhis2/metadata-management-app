import schemaMock from '../../__mocks__/schema/indicatorGroupsSchema.json'
import { SECTIONS_MAP } from '../../lib'
import { testIndicatorGroup } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.indicatorGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testIndicatorGroup
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
