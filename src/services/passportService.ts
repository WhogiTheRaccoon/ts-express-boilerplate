/*
    Service: Passport Config
    Description: Passport configuration for authentication
*/
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db, schema } from '@/db/setup';
import { eq } from 'drizzle-orm';

// Passport Strategies
passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.select().from(schema.users).where(eq(schema.users.username, username));
        if (!user[0]) return done(null, false, { message: 'Incorrect Login' }); 
        
        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) { return done(null, false, { message: 'Incorrect Login' });}
  
        return done(null, user[0] as any);
      } catch (err) {
        return done(err);
      }
    })
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: number, done) => {
  const user = await db.select().from(schema.users).where(eq(schema.users.id, id));
  done(null, user as any);
});