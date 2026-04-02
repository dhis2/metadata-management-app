import React, { useEffect } from 'react'
import { useForm } from 'react-final-form'
import { getSectionPath } from '../../lib'
import { ModelSection } from '../../types'
import { StandardFormSection } from '../standardForm'
import classes from './DefaultFormContents.module.css'
import { DefaultFormErrorNotice } from './DefaultFormErrorNotice'
import { DefaultFormFooter } from './DefaultFormFooter'
import { DuplicationNoticeBox } from './DuplicationNoticeBox'
import { TranslatedFieldsNoticeBox } from './TranslatedFieldsNoticeBox'

type DefaultFormContentsProps = {
    readonly children: React.ReactNode
    readonly section: ModelSection
}

function DefaultFormContents({
    children,
    section,
    showTranslatedFieldsNotice = false,
    showDuplicationNotice = false,
}: DefaultFormContentsProps & {
    readonly showTranslatedFieldsNotice?: boolean
    readonly showDuplicationNotice?: boolean
}) {
    const listPath = `/${getSectionPath(section)}`

    return (
        <>
            <div className={classes.form}>
                {showTranslatedFieldsNotice && <TranslatedFieldsNoticeBox />}
                {showDuplicationNotice && (
                    <DuplicationNoticeBox section={section} />
                )}
                {children}
                <StandardFormSection>
                    <DefaultFormErrorNotice />
                </StandardFormSection>
            </div>
            <DefaultFormFooter cancelTo={listPath} />
        </>
    )
}

export function DefaultEditFormContents(
    props: Readonly<DefaultFormContentsProps>
) {
    return <DefaultFormContents {...props} showTranslatedFieldsNotice={true} />
}

export function DefaultNewFormContents(
    props: Readonly<DefaultFormContentsProps>
) {
    return <DefaultFormContents {...props} showTranslatedFieldsNotice={false} />
}

export function DefaultDuplicateFormContents(
    props: Readonly<DefaultFormContentsProps>
) {
    const form = useForm()
    useEffect(() => {
        form.getRegisteredFields().forEach((field) => {
            form.focus(field)
            form.blur(field)
        })
    }, [form])

    return (
        <div>
            <DefaultFormContents
                {...props}
                showTranslatedFieldsNotice={false}
                showDuplicationNotice={true}
            />
        </div>
    )
}
