import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import { useFormState } from 'react-final-form'
import { ModelSection } from '../../types'
import css from './DuplicationNoticeBox.module.css'

export function DuplicationNoticeBox({
    section,
}: {
    readonly section: ModelSection
}) {
    const { initialValues } = useFormState({
        subscription: { initialValues: true },
    })
    return (
        <NoticeBox
            title={i18n.t('Duplicating {{duplicatedModelName}}', {
                duplicatedModelName: initialValues?.displayName,
            })}
            className={css.noticeBox}
        >
            {i18n.t(
                'All values from the original {{-sectionName}} are included. Values that must be unique need to be updated.',
                { sectionName: section.title }
            )}
        </NoticeBox>
    )
}
