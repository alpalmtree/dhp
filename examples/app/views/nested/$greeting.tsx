import type { Context } from "hono"

export const name = "dynamic.greeting"

export default function(ctx: Context) {
    return <h1>Hello {ctx.req.param('greeting')}</h1>
}