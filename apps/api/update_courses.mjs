import { PrismaClient } from '@prisma/client'; 
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const prisma = new PrismaClient(); 
async function main() { 
  console.log("Using URL:", process.env.DATABASE_URL);
  const result = await prisma.course.updateMany({ 
    where: { title: { not: 'Agentic AI' } }, 
    data: { requiresApproval: true } 
  }); 
  console.log('Updated courses', result); 
} 
main();
