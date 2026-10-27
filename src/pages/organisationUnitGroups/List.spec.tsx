import schemaMock from '../../__mocks__/schema/organisationUnitGroups.json'
import { SECTIONS_MAP } from '../../lib'
import { testOrganisationUnitGroup } from '../../testUtils/builders'
import { generateDefaultListTests } from '../defaultListTests'
import { Component } from './List'

jest.retryTimes(2, { logErrorsBeforeRetry: true })

const section = SECTIONS_MAP.organisationUnitGroup
const mockSchema = schemaMock
const ComponentToTest = Component
const generateRandomElement = testOrganisationUnitGroup
const customData = {}

generateDefaultListTests({
    section,
    mockSchema,
    ComponentToTest,
    generateRandomElement,
    customData,
})
