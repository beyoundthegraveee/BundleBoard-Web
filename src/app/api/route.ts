import { NextResponse } from 'next/server';
import { createSession } from "../lib/session";

export async function POST(request: Request) {
    try{
        const { username, password } = await request.json();

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
            mutation Login($req: AuthRequest!) {
                login(request: $req) {
                accessToken
                refreshToken
                error
                }
            }
            `,
            variables: {
            req: { username, password }
            }
        }),
        });

        const result = await response.json();

        if (result.errors){
            return NextResponse.json({ error: result.errors[0].message || "Authentication failed" }, { status: 401 });
        }
        
        const authData = result.data.login;

        if (authData.error) {
            return NextResponse.json({ error: authData.error }, { status: 401 });
        }

        await createSession(authData.accessToken, authData.refreshToken);
        return NextResponse.json({ message: "Logged in successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}