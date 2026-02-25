import { request } from "./request";

export async function getCurrentUser() {
  const res = await request.get("/api/users/123");
  const data = res.data;
  return data;
}
