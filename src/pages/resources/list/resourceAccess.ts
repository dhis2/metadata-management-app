import { BaseListModel, canEditModel } from '../../../lib'

export type ResourceListModel = BaseListModel & {
    external?: boolean
}

export const isResourceEditable = (model: BaseListModel) =>
    canEditModel(model) && !!(model as ResourceListModel).external
