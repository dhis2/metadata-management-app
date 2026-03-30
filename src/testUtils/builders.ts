import { generateMock } from '@anatine/zod-mock'
import { faker } from '@faker-js/faker'
import { modelFormSchemas } from '../lib'
import {
    AccessSchema,
    UserGroupSchema,
    UserSchema,
} from '../lib/form/modelFormSchemas'
import {
    attributeListSchema,
    attributeFormSchema,
} from '../pages/attributes/form'
import {
    categoryFormSchema,
    categoryListSchema,
} from '../pages/categories/form'
import {
    categoryComboFormSchema,
    categoryComboListSchema,
} from '../pages/categoryCombos/form'
import { categoryOptionComboListSchema } from '../pages/categoryOptionCombos/form'
import {
    categoryOptionGroupFormSchema,
    categoryOptionGroupListSchema,
} from '../pages/categoryOptionGroups/form/categoryOptionGroupSchema'
import {
    categoryOptionGroupSetFormSchema,
    categoryOptionGroupSetListSchema,
} from '../pages/categoryOptionGroupSets/form/categoryOptionGroupSetSchema'
import { categoryOptionListSchema } from '../pages/categoryOptions/form/categoryOptionSchema'
import { ConstantsListSchema } from '../pages/constants/form/ConstantFormSchema'
import { dataApprovalLevelListSchema } from '../pages/dataApprovalLevels/form/dataApprovalLevelsSchema'
import { dataApprovalWorkflowListSchema } from '../pages/dataApprovalWorkflows/form/dataApprovalWorkflowSchema'
import { dataElementGroupListSchema } from '../pages/dataElementGroups/form/dataElementGroupSchema'
import { dataElementGroupSetSchema } from '../pages/dataElementGroupSets/form'
import { dataElementListSchema } from '../pages/dataElements/form/dataElementSchema'
import {
    dataSetNotificationTemplateListSchema,
    dataSetNotificationTemplateFormSchema,
} from '../pages/dataSetNotificationTemplates/form/dataSetNotificationTemplateSchema'
import { dataSetListSchema } from '../pages/dataSets/form/dataSetFormSchema'
import { indicatorGroupListSchema } from '../pages/indicatorGroups/form/indicatorGroupSchema'
import { indicatorGroupSetListSchema } from '../pages/indicatorGroupSets/form/indicatorGroupSetSchema'
import {
    indicatorFormSchema,
    indicatorListSchema,
} from '../pages/indicators/form/indicatorSchema'
import { indicatorTypeListSchema } from '../pages/indicatorTypes/form/indicatorTypesSchema'
import { legendSetListSchema } from '../pages/legendSets/form/legendSetListSchema'
import { localeListSchema } from '../pages/locales/form'
import { OptionGroupListSchema } from '../pages/optionGroups/form/OptionGroupFormSchema'
import {
    optionGroupSetFormSchema,
    optionGroupSetListSchema,
} from '../pages/optionGroupSets/form/optionGroupSetSchema'
import { optionSetListSchema } from '../pages/optionSets/form/optionSetSchema'
import { organisationUnitGroupListSchema } from '../pages/organisationUnitGroups/form/organisationUnitGroupSchema'
import { organisationUnitGroupSetListSchema } from '../pages/organisationUnitGroupSets/form/organisationUnitGroupSetSchema'
import { organisationUnitListSchema } from '../pages/organisationUnits/form/organisationUnitSchema'
import { predictorGroupListSchema } from '../pages/predictorGroups/form/predictorGroupSchema'
import { predictorListSchema } from '../pages/predictors/form/predictorSchema'
import { programIndicatorGroupListSchema } from '../pages/programIndicatorGroups/form'
import { programIndicatorsListSchema } from '../pages/programIndicators/form/programIndicatorsFormSchema'
import { programRuleListSchema } from '../pages/programRules/form/programRuleSchema'
import { programRuleVariableListSchema } from '../pages/programRuleVariables/form/programRuleVariableSchema'
import {
    trackerProgramListSchema,
    stageListSchema,
} from '../pages/programs/form'
import { relationshipTypeListSchema } from '../pages/relationshipTypes/form/RelationshipTypeFormSchema'
import { trackedEntityAttributeListSchema } from '../pages/trackedEntityAttributes/form/TrackedEntityAttributeFormSchema'
import { trackedEntityTypeListSchema } from '../pages/trackedEntityTypes/form'
import {
    validationNotificationTemplateListSchema,
    validationNotificationTemplateFormSchema,
} from '../pages/validationNotificationTemplates/form'
import {
    validationRuleGroupsFormSchema,
    validationRuleGroupsListSchema,
} from '../pages/validationRuleGroups/form/validationRuleGroupsSchema'
import { validationRuleListSchema } from '../pages/validationRules/form/validationRuleSchema'
import {
    CategoryMapping,
    DataElement,
    OptionMapping,
    OrganisationUnit,
    Program,
    ProgramTrackedEntityAttribute,
} from '../types/generated'

const { withDefaultListColumns } = modelFormSchemas

export const randomDhis2Id = () =>
    faker.helpers.fromRegExp(/[a-zA-Z]{1}[a-zA-Z0-9]{10}/)

export function randomValueIn<T>(list: T[]) {
    return list[faker.number.int({ min: 0, max: list.length - 1 })]
}
const mockIsoDateTime = () => {
    const start = new Date(2018, 0, 1).getTime() // Jan 1, 2018
    const end = new Date().getTime() // now
    const randomTime = start + Math.random() * (end - start)
    const randomDate = new Date(randomTime)
    return randomDate.toISOString().replace('Z', '')
}

export const randomLongString = (length: number) => {
    const base = faker.lorem.paragraph() // Or .sentence(), .text()
    let result = ''
    while (result.length < length) {
        result += base + ' '
    }
    return result.slice(0, length) // Trim to exact length
}

const stringMap = {
    lastUpdated: () => mockIsoDateTime(),
}

export const testAccess = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(AccessSchema, { stringMap }),
    ...overwrites,
})

export const testUser = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(UserSchema, { stringMap }),
    ...overwrites,
})

export const testUserGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(UserGroupSchema, { stringMap }),
    ...overwrites,
})

export const testIndicatorType = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(indicatorTypeListSchema, { stringMap }),
    ...overwrites,
})

export const testOptionGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(OptionGroupListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testConstant = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(ConstantsListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testIndicator = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(indicatorListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testIndicatorForm = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(indicatorFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testLegendSets = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(legendSetListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testIndicatorGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(indicatorGroupListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testIndicatorGroupSet = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(indicatorGroupSetListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryOption = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryOptionListSchema, { stringMap }),
    ...overwrites,
})

export const testCategory = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryForm = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryCombo = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryComboListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryComboForm = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryComboFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryOptionCombo = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryOptionComboListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryOptionGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(categoryOptionGroupListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryOptionGroupForm = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(categoryOptionGroupFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCategoryOptionGroupSet = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(categoryOptionGroupSetListSchema, { stringMap }),
    ...overwrites,
})

export const testCategoryOptionGroupSetForm = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(categoryOptionGroupSetFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testDataElementGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(dataElementGroupListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testDataElementGroupSet = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(dataElementGroupSetSchema.merge(withDefaultListColumns), {
        stringMap,
    }),
    ...overwrites,
})

export const testDataElement = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(dataElementListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testDataSet = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(dataSetListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testDataSetNotificationTemplate = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(dataSetNotificationTemplateListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testDataSetNotificationTemplateForm = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(dataSetNotificationTemplateFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testPrograms = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(trackerProgramListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testOptionGroupSet = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(optionGroupSetFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testOptionSets = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(optionSetListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testOptionGroupSetList = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(optionGroupSetListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testOrganisationUnitGroup = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(organisationUnitGroupListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testLocales = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(localeListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testOrganisationUnitGroupSet = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(organisationUnitGroupSetListSchema, { stringMap }),
    ...overwrites,
})

export const testProgramIndicator = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(programIndicatorsListSchema, { stringMap }),
    ...overwrites,
})

export const testProgramRuleVariable = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(programRuleVariableListSchema, { stringMap }),
    ...overwrites,
})

export const testProgramRule = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(programRuleListSchema, { stringMap }),
    ...overwrites,
})

export const testAttributeList = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(attributeListSchema, { stringMap }),
    ...overwrites,
})

export const testdataApprovalLevelList = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(dataApprovalLevelListSchema, { stringMap }),
    ...overwrites,
})

export const testDataApprovalWorkflowList = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(dataApprovalWorkflowListSchema, { stringMap }),
    ...overwrites,
})

export const testAttributeForm = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(attributeFormSchema, { stringMap }),
    ...overwrites,
})

export const testLocale = ({
    locale = faker.string.alpha({ length: 2 }),
    name = faker.location.country(),
} = {}) => ({
    locale,
    name,
    displayNAme: name,
})

export const testCategoryMapping = ({
    id = randomDhis2Id(),
    categoryId = randomDhis2Id(),
    mappingName = faker.company.name(),
    optionMappings = [] as OptionMapping[],
} = {}) => ({
    id,
    categoryId,
    mappingName,
    optionMappings,
})

export const testProgramIndicatorGroup = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(programIndicatorGroupListSchema, { stringMap }),
    ...overwrites,
})

export const testFormProgramIndicatorGroup = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(programIndicatorGroupListSchema, { stringMap }),
    ...overwrites,
})

export const testRelationshipType = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(relationshipTypeListSchema, { stringMap }),
    ...overwrites,
})

export const testTrackedEntityType = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(trackedEntityTypeListSchema, { stringMap }),
    ...overwrites,
})

export const testTrackedEntityAttribute = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(trackedEntityAttributeListSchema, { stringMap }),
    ...overwrites,
})

export const testValidationNotificationTemplate = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(validationNotificationTemplateListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testValidationNotificationTemplateForm = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(validationNotificationTemplateFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testCustomAttribute = ({
    id = randomDhis2Id(),
    displayFormName = faker.person.fullName(),
    mandatory = faker.datatype.boolean(),
    valueType = 'TEXT',
} = {}) => ({
    id,
    displayFormName,
    mandatory,
    valueType,
})

export const testProgram = ({
    id = randomDhis2Id(),
    name = faker.person.fullName(),
    categoryMappings = [] as CategoryMapping[],
    programType = randomValueIn([
        'WITH_REGISTRATION',
        'WITHOUT_REGISTRATION',
    ]) as Program.programType,
    programTrackedEntityAttributes = [] as ProgramTrackedEntityAttribute[],
} = {}) => ({
    id,
    name,
    displayName: name,
    categoryMappings,
    programType,
    programTrackedEntityAttributes,
})

export const testLegendSet = ({
    id = randomDhis2Id(),
    displayName = faker.person.fullName(),
} = {}) => ({
    id,
    displayName,
})

export const testProgramStage = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(stageListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testOrgUnitLevel = ({
    id = randomDhis2Id(),
    name = faker.person.fullName(),
    displayName = faker.person.fullName(),
    access = testAccess(),
    level = null as number | null,
    offlineLevels = null as number | null,
    lastUpdated = faker.date.past().toUTCString(),
} = {}) => ({
    id,
    name,
    displayName,
    access,
    level,
    offlineLevels,
    lastUpdated,
})

export const testOrgUnit = (overwrites: Record<any, any> | undefined = {}) => {
    const mock = generateMock(organisationUnitListSchema, { stringMap })
    return {
        ...mock,
        parent: {
            id: overwrites?.parentId ?? null,
        },
        ancestors: [],
        level: null,
        childCount: 0,
        path: `/${mock.id}`,
        ...overwrites,
    } as unknown as Partial<OrganisationUnit>
}

export const testValidationRuleGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(validationRuleGroupsListSchema, { stringMap }),
    ...overwrites,
})

export const testValidationRuleGroupsForm = (
    overwrites: Record<any, any> = {}
) => ({
    ...generateMock(validationRuleGroupsFormSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testValidationRule = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(validationRuleListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testPredictorList = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(predictorListSchema, {
        stringMap,
    }),
    ...overwrites,
})

export const testPredictorGroup = (overwrites: Record<any, any> = {}) => ({
    ...generateMock(predictorGroupListSchema, {
        stringMap,
    }),
    ...overwrites,
})

// TODO: change when schema for optionset is available
export const testOptionSet = ({
    id = randomDhis2Id(),
    displayName = faker.person.fullName(),
    valueType = randomValueIn(Object.keys(DataElement.valueType)),
} = {}) => ({
    id,
    displayName,
    valueType,
})

export const testOption = ({
    id = randomDhis2Id(),
    name,
    displayName,
}: {
    id?: string
    name?: string
    displayName?: string
} = {}) => {
    const optionName = name ?? faker.word.sample()
    return {
        id,
        name: optionName,
        displayName: displayName ?? optionName,
    }
}
