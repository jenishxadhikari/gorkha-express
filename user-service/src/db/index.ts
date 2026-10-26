import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export default db;
