-- Promote a user to ADMIN by email in public.profiles
-- Usage: replace the email below and run in the Supabase SQL editor

do $$
declare
  v_email   text := 'valibuibar@gmail.com'; -- <=== REPLACE with the target email
  v_user_id uuid;
  v_rows    integer;
begin
  -- Find auth user id by email
  select u.id into v_user_id
  from auth.users u
  where lower(u.email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No auth.user found with email %', v_email;
  end if;

  -- Update existing profile to ADMIN role
  update public.profiles
  set role = 'ADMIN'
  where id = v_user_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    -- If your project creates profiles on first sign-in, ask the user to sign in once
    -- or insert a profile row via your existing onboarding flow before re-running this.
    raise exception 'No profile row found for user id % (email %). Ensure public.profiles has this user first.', v_user_id, v_email;
  end if;

  raise notice 'Promoted % (id=%) to ADMIN in public.profiles', v_email, v_user_id;
end;$$;

