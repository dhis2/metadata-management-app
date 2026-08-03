import i18n from '@dhis2/d2-i18n'
import { Field } from '@dhis2/ui'
import React, { useState, useCallback } from 'react'
import { useField } from 'react-final-form'
import { useHref } from 'react-router'
import {
    DisplayableModel,
    PartialLoadedDisplayableModel,
} from '../../../types/models'
import { ModelSection } from '../../../types/section'
import {
    AddNewDrawerFormFooter,
    DrawerHeader,
    DrawerPortal,
    DrawerRoot,
} from '../../drawer'
import { EditableInputWrapper } from '../../EditableInputWrapper'
import { NewItemFormComponent, useNewItemFormComponent } from '../ModelTransfer'
import {
    ModelSingleSelectFF,
    ModelSingleSelectFieldProps,
    RelevantRenderProps,
    RelevantUseFieldProps,
} from './ModelSingleSelectField'
import { useRefreshModelSingleSelect } from './useRefreshSingleSelect'

const LINK_ONLY_SECTIONS = new Set(['programs'])

export function ModelSingleSelectRefreshableField<
    TModel extends PartialLoadedDisplayableModel
>({
    label,
    helpText,
    required,
    input,
    meta,
    dataTest,
    section,
    newLink,
    NewItemForm,
    newItemFormFooterInfo,
    ...modelSingleSelectProps
}: ModelSingleSelectFieldProps<TModel> &
    RelevantRenderProps<TModel> & {
        section: ModelSection
        newLink: string
        NewItemForm?: NewItemFormComponent
        newItemFormFooterInfo?: string
    }) {
    const refresh = useRefreshModelSingleSelect({
        resource: section.namePlural,
    })
    const [drawerOpen, setDrawerOpen] = useState(false)

    const handleAddNew = useCallback(() => {
        if (NewItemForm) {
            setDrawerOpen(true)
        } else {
            window.open(newLink, '_blank')
        }
    }, [setDrawerOpen, NewItemForm, newLink])

    return (
        <Field
            dataTest={dataTest ?? `formfields-modelsingleselect-${input.name}`}
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
            name={input.name}
            label={label}
            helpText={helpText}
            required={required}
        >
            <DrawerRoot />
            <EditableInputWrapper onRefresh={refresh} onAddNew={handleAddNew}>
                <ModelSingleSelectFF
                    {...modelSingleSelectProps}
                    input={input}
                    meta={meta}
                />
            </EditableInputWrapper>
            {NewItemForm && (
                <DrawerPortal
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    header={
                        <DrawerHeader onClose={() => setDrawerOpen(false)}>
                            {i18n.t('Add new {{name}}', {
                                name: section.title,
                            })}
                        </DrawerHeader>
                    }
                    disableFocusTrap
                >
                    <NewItemForm
                        onSubmitted={() => {
                            refresh()
                            setDrawerOpen(false)
                        }}
                        redirectOnSubmitted={false}
                        footer={
                            <AddNewDrawerFormFooter
                                onCancel={() => setDrawerOpen(false)}
                                newItemFormFooterInfo={newItemFormFooterInfo}
                            />
                        }
                    />
                </DrawerPortal>
            )}
        </Field>
    )
}

export function ModelSingleSelectRefreshableFormField<
    TModel extends DisplayableModel
>({
    // react-final-form props
    name,
    validateFields,
    validate,
    initialValue,
    format,
    parse,
    data,
    section,
    ...modelSingleSelectProps
}: ModelSingleSelectFieldProps<TModel> &
    RelevantUseFieldProps<TModel> & {
        section: ModelSection
    }) {
    const { input, meta } = useField<TModel | undefined>(name, {
        validateFields: validateFields ?? [],
        validate,
        initialValue,
        format,
        parse,
        data,
    })
    const newLink = useHref(`/${section.namePlural ?? ''}/new`)
    const loadComponent = useCallback(
        () => import(`../../../pages/${section.namePlural ?? ''}/New`),
        [section.namePlural]
    )
    const NewItemForm = useNewItemFormComponent(
        LINK_ONLY_SECTIONS.has(section.namePlural) ? undefined : loadComponent
    )

    return (
        <ModelSingleSelectRefreshableField
            input={input}
            meta={meta}
            section={section}
            newLink={newLink}
            NewItemForm={NewItemForm}
            newItemFormFooterInfo={i18n.t(
                "Saving this {{name}} won't apply unsaved changes in the form below.",
                { name: section.title.toLowerCase() }
            )}
            {...modelSingleSelectProps}
        />
    )
}
