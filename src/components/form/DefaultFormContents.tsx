import React, { useEffect } from 'react'
import { useForm } from 'react-final-form'
import { getSectionPath } from '../../lib'
import { ModelSection } from '../../types'
import { StandardFormSection } from '../standardForm'
import { CloneNoticeBox } from './cloning'
import classes from './DefaultFormContents.module.css'
import { DefaultFormErrorNotice } from './DefaultFormErrorNotice'
import { DefaultFormFooter } from './DefaultFormFooter'
import { TranslatedFieldsNoticeBox } from './TranslatedFieldsNoticeBox'

type DefaultFormContentsProps = {
    readonly children: React.ReactNode
    readonly section: ModelSection
}

function DefaultFormContents({
    children,
    section,
    showTranslatedFieldsNotice = false,
    showCloneNotice = false,
}: DefaultFormContentsProps & {
    readonly showTranslatedFieldsNotice?: boolean
    readonly showCloneNotice?: boolean
}) {
    const listPath = `/${getSectionPath(section)}`

    return (
        <>
            <div className={classes.form}>
                {showTranslatedFieldsNotice && <TranslatedFieldsNoticeBox />}
                {showCloneNotice && <CloneNoticeBox section={section} />}
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

export function DefaultCloneFormContents(
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
                showCloneNotice={true}
            />
        </div>
    )
}
