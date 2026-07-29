import { NoticeBox } from '@dhis2/ui'
import React from 'react'
import css from './UnsavedDataElementsNotice.module.css'

export const UnsavedDataElementsNotice = ({ message }: { message: string }) => (
    <NoticeBox className={css.unsavedNoticeBox}>{message}</NoticeBox>
)
