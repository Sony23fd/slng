import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import https from 'http';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

async function test() {
  const salesUser = await prisma.user.findFirst({ where: { role: 'SALES' } });
  if (!salesUser) {
    console.log("No sales user found.");
    return;
  }
  
  const token = jwt.sign({ id: salesUser.id, role: salesUser.role }, SECRET, { expiresIn: '1h' });
  console.log("Generated token for SALES user:", salesUser.name);

  const req = https.request('http://localhost:3001/api/prices', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk.toString().substring(0, 50)}...`);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
}

test();
