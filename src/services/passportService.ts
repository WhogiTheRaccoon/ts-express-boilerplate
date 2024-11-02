/*
    Service: Passport Config
    Description: Passport configuration for authentication
*/
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db, eq } from '@/db/setup';
import { users } from '@/db/schema';

// Passport Strategies
passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.select().from(users).where(eq(users.username, username));
        if (!user[0]) return done(null, false, { message: 'Incorrect Login' }); 
        
        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) { return done(null, false, { message: 'Incorrect Login' });}
  
        return done(null, user[0]);
      } catch (err) {
        return done(err);
      }
    })
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  const user = await db.select().from(users).where(eq(users.id, id));
  done(null, user);
});