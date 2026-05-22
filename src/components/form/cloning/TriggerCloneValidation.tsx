import React, { useEffect } from 'react'
import { useForm } from 'react-final-form'

export const TriggerCloneValidation = () => {
    const form = useForm()
    useEffect(() => {
        form.getRegisteredFields().forEach((field) => {
            form.focus(field)
            form.blur(field)
        })
    }, [form])
    return null
}
