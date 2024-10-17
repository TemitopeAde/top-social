'use server';

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema, signUpValues } from "@/lib/validation";
import bcrypt from "bcrypt";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Set the bcrypt salt rounds (recommended 10-12 for production)
const SALT_ROUNDS = 10;

export async function signUp(credentials: signUpValues): Promise<{ error: string }> {
    try {
        const { email, password, username } = signUpSchema.parse(credentials);

        // Hash password using bcrypt
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const userId = generateIdFromEntropySize(10);

        const existingUsername = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
        });

        if (existingUsername) {
            return {
                error: "Username already taken",
            };
        }

        const existingEmail = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: "insensitive",
                },
            },
        });

        if (existingEmail) {
            return {
                error: "Email already taken",
            };
        }

        // Create new user in the database
        await prisma.user.create({
            data: {
                id: userId,
                username,
                displayName: username,
                email,
                passwordHash,
            },
        });

        // Create session using lucia
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // Set session cookie
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        // Redirect to homepage after successful signup
        return redirect("/");
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.log(error);
        return {
            error: "Something went wrong",
        };
    }
}
