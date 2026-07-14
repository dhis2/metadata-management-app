import schemaMock from '../../__mocks__/schema/organisationUnitGroupSets.json'
import { SECTIONS_MAP } from '../../lib'
import { testOrganisationUnitGroupSet } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

const section = SECTIONS_MAP.organisationUnitGroupSet
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testOrganisationUnitGroupSet
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
