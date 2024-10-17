'use server'

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, loginValues } from "@/lib/validation";
import bcrypt from "bcrypt";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(credentials: loginValues): Promise<{ error: string }> {
    try {
        const { password, username } = loginSchema.parse(credentials);
        
        // Find the user in the database
        const existingUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
        });

        if (!existingUser || !existingUser.passwordHash) {
            return {
                error: "Incorrect username or password",
            };
        }

        // Compare the entered password with the stored hash
        const validPassword = await bcrypt.compare(password, existingUser.passwordHash);

        if (!validPassword) {
            return {
                error: "Incorrect username or password",
            };
        }

        // Create session if password is valid
        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        // Set the session cookie
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        // Redirect to home page after successful login
        return redirect("/");
        
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.log(error);
        return {
            error: "Something went wrong",
        };
    }
}
