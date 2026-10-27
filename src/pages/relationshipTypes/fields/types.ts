import { RelationshipEntity } from '../../../types/generated'
import { DisplayableModel } from '../../../types/models'

export type ConstraintValue = RelationshipEntity

export type RelationshipSideFieldsProps = {
    prefix: 'from' | 'to'
}

export type ProgramStageWithDataElements = DisplayableModel & {
    programStageDataElements?: Array<{
        dataElement?: DisplayableModel
    }>
}
