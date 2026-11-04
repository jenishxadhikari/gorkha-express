import { UserCreateInput } from "../../../generated/prisma/models.js";
import db from "../../db/index.js";

async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
  });
}

async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
  });
}

async function createUser(data: UserCreateInput) {
  return await db.user.create({ data });
}

export const AuthRepository = {
  getUserByEmail,
  getUserById,
  createUser,
};
