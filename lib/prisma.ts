// Load environment variable mappings strictly from the `.env` root path during non-managed startup contexts
import "dotenv/config"
// Import native driver adapters to route the Prisma queries into standard PostgreSQL wire mappings
import { PrismaPg } from "@prisma/adapter-pg"
// Import automatically generated Prisma database schema object abstraction
import { PrismaClient } from "@/generated/prisma/client"

// Securely assign the isolated primary Postgres connection endpoint path into a constant
const connectionString = `${process.env.DATABASE_URL}`

// Generate a pg native query adapter driver
const adapter = new PrismaPg({ connectionString })
// Type definition to allow persisting across independent Next.js fast-refresh rebuild hooks
const globalForPrisma = global as unknown as { prisma: PrismaClient }
// Check for a globally cached active network pool driver, allocating a new initialized Prisma block strictly if undefined
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

// Append our working memory singleton cache instance so live reload cycles won't leak disconnected client references and cause pooling errors
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Expose driver globally to handle all database transactions
export default prisma
