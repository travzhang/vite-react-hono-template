import { Hono } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "@hono/node-server/serve-static";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const app = new Hono();

const api = new OpenAPIHono();

import { createRoute, z } from "@hono/zod-openapi";
import { prisma } from "@/api/lib/prisma.ts";

const ParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "1212121",
    }),
});

const UserSchema = z
  .object({
    id: z.string().openapi({
      example: "123",
    }),
    name: z.string().openapi({
      example: "John Doe",
    }),
    age: z.number().openapi({
      example: 42,
    }),
  })
  .openapi("User");

const route = createRoute({
  method: "get",
  path: "/users/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Retrieve the user",
    },
  },
});

api.openapi(route, async (c) => {
  const { id } = c.req.valid("param");

  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post!",
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log("Created user:", user);
  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));

  return c.json({
    id,
    age: 20,
    name: "Ultra-man",
  });
});

// The OpenAPI documentation will be available at /api/doc
api.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

// Use the middleware to serve Swagger UI at /api/ui
api.get("/ui", swaggerUI({ url: "/api/doc" }));

api.get("/health", (c) => c.text("OK"));

app.route("/api", api);

// 托管当前目录（生产时 dist/）的静态文件，index.html、assets 等
app.use("/*", serveStatic({ root: __dirname }));

export default app;
