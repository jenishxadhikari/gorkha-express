import db from "../../db/index.js";
import { UserCreateInput } from "../../../generated/prisma/models.js";

async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
  });
}

async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
  });
}

async function createUser(data: UserCreateInput) {
  return await db.user.create({ data });
}

export const AuthRepository = {
  getUserByEmail,
  getUserById,
  createUser
}