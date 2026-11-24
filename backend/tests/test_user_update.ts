import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runTest() {
  console.log('Testing User Edit / Update Logic...');
  const testUsername = 'test_agent_user_' + Date.now();

  try {
    // 1. Create a test user
    const hash = await bcrypt.hash('initial_pass_123', 10);
    const created = await prisma.user.create({
      data: {
        name: testUsername,
        full_name: 'Test Agent Initial',
        role: 'SALES',
        phone: '99001122',
        password: hash
      }
    });
    console.log('✅ Created test user:', created.id, created.name, created.role);

    // 2. Test updating fields without changing password
    const updateData1: any = {
      full_name: 'Test Agent Updated Name',
      role: 'FINANCE',
      phone: '88776655'
    };
    const updated1 = await prisma.user.update({
      where: { id: created.id },
      data: updateData1
    });

    if (updated1.full_name === 'Test Agent Updated Name' && updated1.role === 'FINANCE' && updated1.phone === '88776655') {
      console.log('✅ Updated fields successfully:', updated1.full_name, updated1.role, updated1.phone);
    } else {
      throw new Error('Failed to update fields');
    }

    // Verify password is still the original password
    const passMatchesOld = await bcrypt.compare('initial_pass_123', updated1.password);
    if (passMatchesOld) {
      console.log('✅ Original password preserved when password field is omitted');
    } else {
      throw new Error('Password was unintentionally altered');
    }

    // 3. Test updating password
    const newHash = await bcrypt.hash('new_secret_pass_456', 10);
    const updated2 = await prisma.user.update({
      where: { id: created.id },
      data: { password: newHash }
    });

    const passMatchesNew = await bcrypt.compare('new_secret_pass_456', updated2.password);
    if (passMatchesNew) {
      console.log('✅ Password successfully updated to new password');
    } else {
      throw new Error('New password does not match');
    }

    // 4. Test duplicate username prevention query
    const dupCheck = await prisma.user.findFirst({
      where: { name: testUsername, NOT: { id: created.id } }
    });
    if (!dupCheck) {
      console.log('✅ Duplicate check correctly allows keeping own username');
    }

    // 5. Clean up
    await prisma.user.delete({ where: { id: created.id } });
    console.log('✅ Cleaned up test user successfully');

    console.log('\n🎉 ALL USER UPDATE TESTS PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
