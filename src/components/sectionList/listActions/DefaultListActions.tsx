import React from 'react'
import {
    BaseListModel,
    useModelSectionHandleOrThrow,
    useSchemaFromHandle,
} from '../../../lib'
import { canEditModel, canDeleteModel } from '../../../lib/models/access'
import {
    ListActions,
    ActionShowDetails,
    ActionMore,
} from './SectionListActions'

export type DefaultListActionProps = {
    model: BaseListModel
    onShowDetailsClick: (model: BaseListModel) => void
    onOpenSharingClick: (id: string) => void
    onOpenTranslationClick: (model: BaseListModel) => void
    onDeleteSuccess: (model: BaseListModel) => void
}

export const DefaultListActions = ({
    model,
    onShowDetailsClick,
    onOpenSharingClick,
    onOpenTranslationClick,
    onDeleteSuccess,
}: DefaultListActionProps) => {
    const schema = useSchemaFromHandle()
    const section = useModelSectionHandleOrThrow()
    const deletable = canDeleteModel(model)
    const editable = canEditModel(model)
    const shareable = schema.shareable
    const duplicable = !!section.duplicable

    return (
        <ListActions>
            <ActionShowDetails onClick={() => onShowDetailsClick(model)} />
            <ActionMore
                deletable={deletable}
                editable={editable}
                translatable={schema.translatable}
                shareable={shareable}
                duplicable={duplicable}
                model={model}
                onShowDetailsClick={() => onShowDetailsClick(model)}
                onOpenSharingClick={() => onOpenSharingClick(model.id)}
                onTranslateClick={() => onOpenTranslationClick(model)}
                onDeleteSuccess={() => onDeleteSuccess(model)}
            />
        </ListActions>
    )
}
