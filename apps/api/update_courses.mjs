import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  await prisma.course.updateMany({ 
    where: { title: { not: 'Agentic AI' } }, 
    data: { requiresApproval: true } 
  }); 
  console.log('Updated courses'); 
} 
main();
