import { AppDataSource } from '../dataSource';
import { User } from '../../entities/user.entity';

async function seedAdminUser() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);

  const existingAdmin = await userRepository.findOneBy({ email: 'vishrutabrol257@gmail.com' });
  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }
  const adminUser = userRepository.create({
    fullName: 'Vishrut Abrol',
    email: 'vishrutabrol257@gmail.com',
    phoneNo: '7876689982',
    password: '123456789',
    role: 'admin',
  });

  await userRepository.save(adminUser);
  console.log('✅ Admin user seeded successfully.');
}
seedAdminUser().catch((error) => {
  console.error('❌ Error seeding admin user:', error);
});
