import React, { useState } from 'react'
import css from '../../components/sectionList/SectionList.module.css'
import { DefaultToolbar } from '../../components/sectionList/toolbar'
import { TranslationDialog } from '../../components/sectionList/translation'
import { BaseListModel } from '../../lib'
import { ListRows } from './ListRows'

export const Component = () => {
    const [translationDialogModel, setTranslationDialogModel] = useState<
        BaseListModel | undefined
    >(undefined)
    return (
        <div>
            <div className={css.listDetailsWrapper}>
                <DefaultToolbar
                    selectedModels={new Set()}
                    onDeselectAll={() => {}}
                    downloadable={false}
                />
                <ListRows onTranslationClick={setTranslationDialogModel} />
            </div>
            {translationDialogModel && (
                <TranslationDialog
                    model={translationDialogModel}
                    onClose={() => setTranslationDialogModel(undefined)}
                />
            )}
        </div>
    )
}
