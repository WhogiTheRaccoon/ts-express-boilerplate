import { db } from './setup';
import { users } from './schema';
import { User } from '@/types/types';
import { faker } from '@faker-js/faker';
import logger from '@/services/loggerService';

// Constants
const NUM_USERS: number = Number(process.argv[2]);

if(!NUM_USERS) {
    console.error('Please provide a number of users to seed: `npm run db:seed <number>`');
    process.exit(1);
}

// Seed users table with random data we use int to avoid duplicate fields as username and email are unique
export function createRandomUser(): User {
    return { // id is auto-incremented
      username: `${faker.number.int}-${faker.internet.userName()}`,
      email: `${faker.number.int}${faker.internet.email()}`,
      password: faker.internet.password(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
}

export async function seedUsersTable() {
    const usersToSeed = Array.from({ length: NUM_USERS }, createRandomUser);
    await db.insert(users).values(usersToSeed);
}

seedUsersTable().then(() => {
    console.log(`Seeded ${NUM_USERS} users into the database`);
    process.exit(0);
}).catch((err) => {
    logger.error(`Error during Seeding: ${err}`);
    process.exit(1);
});