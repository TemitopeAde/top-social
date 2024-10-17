import { z } from 'zod';

const requiredString = z.string().trim().min(1, "Required field")

export const signUpSchema = z.object({
    email: requiredString.email(),
    username: requiredString.regex(
        /^[a-zA-Z0-9_-]+$/,
        "Only letters, numbers, - and _ allowed",
    ),
    password: requiredString.min(8, "Must be at least 8 characters")
})

export const loginSchema = z.object({
    username: requiredString,
    password: requiredString
})


export type signUpValues = z.infer<typeof signUpSchema>
export type loginValues = z.infer<typeof loginSchema>