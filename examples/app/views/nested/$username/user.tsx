import type { Context } from "hono"

export const name = "dynamic"

export default function(ctx: Context) {
    return <h1>Welcome, user {ctx.req.param('username')}</h1>
}