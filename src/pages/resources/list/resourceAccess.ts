import { BaseListModel, canEditModel } from '../../../lib'

type ResourceListModel = BaseListModel & {
    external?: boolean
}

export const isResourceEditable = (model: BaseListModel) =>
    canEditModel(model) && !!(model as ResourceListModel).external
