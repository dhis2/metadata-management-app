import i18n from '@dhis2/d2-i18n'
import {
    Field as UIField,
    FileInput,
    FileInputChangeHandler,
    FileList,
    FileListItem,
} from '@dhis2/ui'
import React, { useState } from 'react'
import { useField, useForm } from 'react-final-form'

const fileToBase64 = (file: File): Promise<string> => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
    })
}

const filenameToKey = (filename: string) =>
    filename
        .replace(/\.[^.]+$/, '')
        .replace(/[-\s]+/g, '_')
        .toLowerCase()

export function IconFileField() {
    const form = useForm()
    const { input, meta } = useField<File | null | undefined>('file')

    const [preview, setPreview] = useState<string | undefined>()

    const handleChange: FileInputChangeHandler = async ({ files }) => {
        const file = files[0]
        if (!(file instanceof File)) {
            return
        }

        input.onChange(file)
        input.onBlur()

        const currentKey = form.getState().values.key
        if (!currentKey) {
            form.change('key', filenameToKey(file.name))
        }

        const base64 = await fileToBase64(file)
        setPreview(base64)
    }

    const handleRemove = () => {
        input.onChange(null)
        input.onBlur()
        setPreview(undefined)
    }

    const hasError = meta.touched && meta.invalid

    return (
        <UIField
            label={i18n.t('Icon file')}
            name="file"
            required
            error={hasError}
            validationText={hasError ? meta.error : undefined}
        >
            {preview && (
                <img
                    src={preview}
                    alt={i18n.t('Icon preview')}
                    style={{
                        width: 48,
                        height: 48,
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
            )}
            <FileInput
                accept="image/png"
                buttonLabel={
                    input.value instanceof File
                        ? i18n.t('Change icon')
                        : i18n.t('Upload icon')
                }
                multiple={false}
                name="iconFile"
                onChange={handleChange}
                error={hasError}
            />
            <FileList>
                {input.value instanceof File && (
                    <FileListItem
                        label={input.value.name}
                        onRemove={handleRemove}
                        removeText={i18n.t('Remove')}
                    />
                )}
            </FileList>
        </UIField>
    )
}
