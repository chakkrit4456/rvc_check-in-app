-- This script fixes the new user registration trigger by ensuring it has the correct permissions.
-- 1. It creates the function and trigger.
-- 2. It changes the function's owner to 'supabase_admin' to grant it necessary permissions
--    to read from the 'auth.users' table.
--
-- ==> IMPORTANT <==
-- Run this entire script in your Supabase SQL Editor to apply the fix.

-- Drop the old trigger and function if they exist, to ensure a clean setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Creates a function that inserts a new row into public.profiles
-- for each new user in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET SEARCH_PATH = public
AS $$
BEGIN
  -- Insert a new profile row, setting the id, email, and a default role.
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'student');
  RETURN new;
END;
$$;

-- Creates a trigger that executes the handle_new_user function
-- every time a new user is added to the auth.users table.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Change the owner of the function to the 'supabase_admin' role,
-- which has the required permissions.
ALTER FUNCTION public.handle_new_user() OWNER TO supabase_admin;

-- Grant execution rights on the function to the 'postgres' and 'authenticated' roles.
-- 'postgres' is the role used by the Supabase dashboard and APIs.
-- 'authenticated' is the role for logged-in users.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Grant permissions for the authenticated role to interact with the database.
-- This ensures that after a user signs up, they can update their own profile.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.classrooms TO authenticated;
GRANT ALL ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.activities TO authenticated;
GRANT ALL ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.attendance TO authenticated;