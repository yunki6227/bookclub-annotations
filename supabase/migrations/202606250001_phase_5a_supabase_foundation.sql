create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.club_members (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  author text,
  created_by_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_files (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  storage_path text not null check (length(trim(storage_path)) > 0),
  file_hash text not null check (length(trim(file_hash)) > 0),
  page_count integer not null check (page_count > 0),
  mime_type text not null check (length(trim(mime_type)) > 0),
  created_at timestamptz not null default now(),
  constraint book_files_id_book_id_unique unique (id, book_id)
);

create table public.club_books (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  book_file_id uuid not null,
  added_by_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint club_books_book_file_matches_book_fk
    foreign key (book_file_id, book_id)
    references public.book_files(id, book_id)
);

create table public.annotation_pages (
  id uuid primary key default gen_random_uuid(),
  club_book_id uuid not null references public.club_books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  page_index integer not null check (page_index >= 0),
  strokes jsonb not null default '[]'::jsonb check (jsonb_typeof(strokes) = 'array'),
  revision integer not null default 1 check (revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_book_id, user_id, page_index)
);

create table public.page_annotation_summaries (
  club_book_id uuid not null references public.club_books(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  page_index integer not null check (page_index >= 0),
  stroke_count integer not null default 0 check (stroke_count >= 0),
  last_annotated_at timestamptz not null default now(),
  primary key (club_book_id, user_id, page_index)
);

create index profiles_display_name_idx on public.profiles (display_name);
create index clubs_owner_user_id_idx on public.clubs (owner_user_id);
create index club_members_user_id_idx on public.club_members (user_id);
create index club_members_club_id_role_idx on public.club_members (club_id, role);
create index books_created_by_user_id_idx on public.books (created_by_user_id);
create index book_files_book_id_idx on public.book_files (book_id);
create index book_files_file_hash_idx on public.book_files (file_hash);
create index club_books_club_id_idx on public.club_books (club_id);
create index club_books_book_id_idx on public.club_books (book_id);
create index club_books_book_file_id_idx on public.club_books (book_file_id);
create index annotation_pages_user_id_idx on public.annotation_pages (user_id);
create index annotation_pages_club_book_page_idx on public.annotation_pages (club_book_id, page_index);
create index page_annotation_summaries_user_id_idx on public.page_annotation_summaries (user_id);
create index page_annotation_summaries_club_book_page_idx on public.page_annotation_summaries (club_book_id, page_index);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger clubs_set_updated_at
before update on public.clubs
for each row execute function private.set_updated_at();

create trigger books_set_updated_at
before update on public.books
for each row execute function private.set_updated_at();

create trigger annotation_pages_set_updated_at
before update on public.annotation_pages
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(pg_catalog.split_part(coalesce(new.email, ''), '@', 1), ''),
      'Reader ' || pg_catalog.substr(new.id::text, 1, 8)
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function private.handle_new_user_profile();

create or replace function private.handle_new_club_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.club_members (club_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (club_id, user_id) do nothing;

  return new;
end;
$$;

create trigger on_club_created_owner_membership
after insert on public.clubs
for each row execute function private.handle_new_club_owner_membership();

create or replace function private.sync_page_annotation_summary()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.page_annotation_summaries
    where club_book_id = old.club_book_id
      and user_id = old.user_id
      and page_index = old.page_index;

    return old;
  end if;

  if tg_op = 'UPDATE'
    and (
      old.club_book_id is distinct from new.club_book_id
      or old.user_id is distinct from new.user_id
      or old.page_index is distinct from new.page_index
    )
  then
    delete from public.page_annotation_summaries
    where club_book_id = old.club_book_id
      and user_id = old.user_id
      and page_index = old.page_index;
  end if;

  if pg_catalog.jsonb_array_length(new.strokes) = 0 then
    delete from public.page_annotation_summaries
    where club_book_id = new.club_book_id
      and user_id = new.user_id
      and page_index = new.page_index;

    return new;
  end if;

  insert into public.page_annotation_summaries (
    club_book_id,
    user_id,
    page_index,
    stroke_count,
    last_annotated_at
  )
  values (
    new.club_book_id,
    new.user_id,
    new.page_index,
    pg_catalog.jsonb_array_length(new.strokes),
    pg_catalog.now()
  )
  on conflict (club_book_id, user_id, page_index)
  do update set
    stroke_count = excluded.stroke_count,
    last_annotated_at = excluded.last_annotated_at;

  return new;
end;
$$;

create trigger annotation_pages_sync_summary
after insert or update or delete on public.annotation_pages
for each row execute function private.sync_page_annotation_summary();

create or replace function private.is_current_user_club_member(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.club_members member
      where member.club_id = target_club_id
        and member.user_id = auth.uid()
    );
$$;

create or replace function private.is_current_user_club_owner(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.clubs club
      where club.id = target_club_id
        and club.owner_user_id = auth.uid()
    );
$$;

create or replace function private.is_current_user_club_admin_or_owner(target_club_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.club_members member
      where member.club_id = target_club_id
        and member.user_id = auth.uid()
        and member.role in ('owner', 'admin')
    );
$$;

create or replace function private.current_user_shares_club_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user_id = auth.uid()
    or exists (
      select 1
      from public.club_members viewer
      join public.club_members peer
        on peer.club_id = viewer.club_id
      where viewer.user_id = auth.uid()
        and peer.user_id = target_user_id
    );
$$;

create or replace function private.club_owner_user_id(target_club_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select club.owner_user_id
  from public.clubs club
  where club.id = target_club_id;
$$;

create or replace function private.is_current_user_book_creator(target_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.books book
      where book.id = target_book_id
        and book.created_by_user_id = auth.uid()
    );
$$;

create or replace function private.current_user_can_read_book(target_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_current_user_book_creator(target_book_id)
    or exists (
      select 1
      from public.club_books club_book
      where club_book.book_id = target_book_id
        and private.is_current_user_club_member(club_book.club_id)
    );
$$;

create or replace function private.current_user_can_access_club_book(target_club_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.club_books club_book
      where club_book.id = target_club_book_id
        and private.is_current_user_club_member(club_book.club_id)
    );
$$;

create or replace function private.current_user_can_manage_club_book(target_club_book_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.club_books club_book
      where club_book.id = target_club_book_id
        and private.is_current_user_club_admin_or_owner(club_book.club_id)
    );
$$;

create or replace function public.create_club_with_owner(club_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_club_name text := pg_catalog.btrim(club_name);
  new_club_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if normalized_club_name is null or pg_catalog.length(normalized_club_name) = 0 then
    raise exception 'Club name is required';
  end if;

  if pg_catalog.length(normalized_club_name) > 120 then
    raise exception 'Club name must be 120 characters or fewer';
  end if;

  insert into public.clubs (name, owner_user_id)
  values (normalized_club_name, current_user_id)
  returning id into new_club_id;

  return new_club_id;
end;
$$;

revoke all on function private.set_updated_at() from public;
revoke all on function private.set_updated_at() from anon;
revoke all on function private.set_updated_at() from authenticated;
revoke all on function private.handle_new_user_profile() from public;
revoke all on function private.handle_new_user_profile() from anon;
revoke all on function private.handle_new_user_profile() from authenticated;
revoke all on function private.handle_new_club_owner_membership() from public;
revoke all on function private.handle_new_club_owner_membership() from anon;
revoke all on function private.handle_new_club_owner_membership() from authenticated;
revoke all on function private.sync_page_annotation_summary() from public;
revoke all on function private.sync_page_annotation_summary() from anon;
revoke all on function private.sync_page_annotation_summary() from authenticated;

revoke all on function private.is_current_user_club_member(uuid) from public;
revoke all on function private.is_current_user_club_owner(uuid) from public;
revoke all on function private.is_current_user_club_admin_or_owner(uuid) from public;
revoke all on function private.current_user_shares_club_with(uuid) from public;
revoke all on function private.club_owner_user_id(uuid) from public;
revoke all on function private.is_current_user_book_creator(uuid) from public;
revoke all on function private.current_user_can_read_book(uuid) from public;
revoke all on function private.current_user_can_access_club_book(uuid) from public;
revoke all on function private.current_user_can_manage_club_book(uuid) from public;
revoke all on function public.create_club_with_owner(text) from public;
revoke all on function public.create_club_with_owner(text) from anon;

grant execute on function private.is_current_user_club_member(uuid) to authenticated;
grant execute on function private.is_current_user_club_owner(uuid) to authenticated;
grant execute on function private.is_current_user_club_admin_or_owner(uuid) to authenticated;
grant execute on function private.current_user_shares_club_with(uuid) to authenticated;
grant execute on function private.club_owner_user_id(uuid) to authenticated;
grant execute on function private.is_current_user_book_creator(uuid) to authenticated;
grant execute on function private.current_user_can_read_book(uuid) to authenticated;
grant execute on function private.current_user_can_access_club_book(uuid) to authenticated;
grant execute on function private.current_user_can_manage_club_book(uuid) to authenticated;
grant execute on function public.create_club_with_owner(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.books enable row level security;
alter table public.book_files enable row level security;
alter table public.club_books enable row level security;
alter table public.annotation_pages enable row level security;
alter table public.page_annotation_summaries enable row level security;

create policy "Profiles readable by self and club peers"
on public.profiles
for select
to authenticated
using (id = auth.uid() or private.current_user_shares_club_with(id));

create policy "Users update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members read their clubs"
on public.clubs
for select
to authenticated
using (private.is_current_user_club_member(id));

create policy "Owners update club names"
on public.clubs
for update
to authenticated
using (private.is_current_user_club_owner(id))
with check (
  private.is_current_user_club_owner(id)
  and owner_user_id = auth.uid()
);

create policy "Owners delete their clubs"
on public.clubs
for delete
to authenticated
using (private.is_current_user_club_owner(id));

create policy "Members read club membership"
on public.club_members
for select
to authenticated
using (private.is_current_user_club_member(club_id));

create policy "Owners add non-owner club members"
on public.club_members
for insert
to authenticated
with check (
  private.is_current_user_club_owner(club_id)
  and role in ('admin', 'member')
  and user_id <> private.club_owner_user_id(club_id)
);

create policy "Owners update non-owner club members"
on public.club_members
for update
to authenticated
using (
  private.is_current_user_club_owner(club_id)
  and role <> 'owner'
  and user_id <> private.club_owner_user_id(club_id)
)
with check (
  private.is_current_user_club_owner(club_id)
  and role in ('admin', 'member')
  and user_id <> private.club_owner_user_id(club_id)
);

create policy "Owners remove non-owner club members"
on public.club_members
for delete
to authenticated
using (
  private.is_current_user_club_owner(club_id)
  and role <> 'owner'
  and user_id <> private.club_owner_user_id(club_id)
);

create policy "Club members read attached books"
on public.books
for select
to authenticated
using (private.current_user_can_read_book(id));

create policy "Authenticated users create book metadata"
on public.books
for insert
to authenticated
with check (created_by_user_id = auth.uid());

create policy "Book creators update metadata"
on public.books
for update
to authenticated
using (private.is_current_user_book_creator(id))
with check (
  private.is_current_user_book_creator(id)
  and created_by_user_id = auth.uid()
);

create policy "Book creators delete metadata"
on public.books
for delete
to authenticated
using (private.is_current_user_book_creator(id));

create policy "Club members read attached book files"
on public.book_files
for select
to authenticated
using (private.current_user_can_read_book(book_id));

create policy "Book creators create book file metadata"
on public.book_files
for insert
to authenticated
with check (private.is_current_user_book_creator(book_id));

create policy "Book creators update book file metadata"
on public.book_files
for update
to authenticated
using (private.is_current_user_book_creator(book_id))
with check (private.is_current_user_book_creator(book_id));

create policy "Book creators delete book file metadata"
on public.book_files
for delete
to authenticated
using (private.is_current_user_book_creator(book_id));

create policy "Club members read club books"
on public.club_books
for select
to authenticated
using (private.is_current_user_club_member(club_id));

create policy "Owners and admins add club books"
on public.club_books
for insert
to authenticated
with check (
  private.is_current_user_club_admin_or_owner(club_id)
  and private.current_user_can_read_book(book_id)
  and added_by_user_id = auth.uid()
);

create policy "Owners and admins update club books"
on public.club_books
for update
to authenticated
using (private.is_current_user_club_admin_or_owner(club_id))
with check (
  private.is_current_user_club_admin_or_owner(club_id)
  and private.current_user_can_read_book(book_id)
);

create policy "Owners and admins remove club books"
on public.club_books
for delete
to authenticated
using (private.is_current_user_club_admin_or_owner(club_id));

create policy "Club members read annotation pages"
on public.annotation_pages
for select
to authenticated
using (private.current_user_can_access_club_book(club_book_id));

create policy "Users create their own annotation pages"
on public.annotation_pages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and private.current_user_can_access_club_book(club_book_id)
);

create policy "Users update their own annotation pages"
on public.annotation_pages
for update
to authenticated
using (
  user_id = auth.uid()
  and private.current_user_can_access_club_book(club_book_id)
)
with check (
  user_id = auth.uid()
  and private.current_user_can_access_club_book(club_book_id)
);

create policy "Users delete their own annotation pages"
on public.annotation_pages
for delete
to authenticated
using (
  user_id = auth.uid()
  and private.current_user_can_access_club_book(club_book_id)
);

create policy "Club members read page annotation summaries"
on public.page_annotation_summaries
for select
to authenticated
using (private.current_user_can_access_club_book(club_book_id));

revoke all on table public.profiles from public;
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
revoke all on table public.clubs from public;
revoke all on table public.clubs from anon;
revoke all on table public.clubs from authenticated;
revoke all on table public.club_members from public;
revoke all on table public.club_members from anon;
revoke all on table public.club_members from authenticated;
revoke all on table public.books from public;
revoke all on table public.books from anon;
revoke all on table public.books from authenticated;
revoke all on table public.book_files from public;
revoke all on table public.book_files from anon;
revoke all on table public.book_files from authenticated;
revoke all on table public.club_books from public;
revoke all on table public.club_books from anon;
revoke all on table public.club_books from authenticated;
revoke all on table public.annotation_pages from public;
revoke all on table public.annotation_pages from anon;
revoke all on table public.annotation_pages from authenticated;
revoke all on table public.page_annotation_summaries from public;
revoke all on table public.page_annotation_summaries from anon;
revoke all on table public.page_annotation_summaries from authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

grant select, delete on table public.clubs to authenticated;
grant update (name) on table public.clubs to authenticated;

grant select, delete on table public.club_members to authenticated;
grant insert (club_id, user_id, role) on table public.club_members to authenticated;
grant update (role) on table public.club_members to authenticated;

grant select, delete on table public.books to authenticated;
grant insert (title, author, created_by_user_id) on table public.books to authenticated;
grant update (title, author) on table public.books to authenticated;

grant select, delete on table public.book_files to authenticated;
grant insert (book_id, storage_path, file_hash, page_count, mime_type) on table public.book_files to authenticated;
grant update (storage_path, file_hash, page_count, mime_type) on table public.book_files to authenticated;

grant select, delete on table public.club_books to authenticated;
grant insert (club_id, book_id, book_file_id, added_by_user_id) on table public.club_books to authenticated;
grant update (book_id, book_file_id) on table public.club_books to authenticated;

grant select, delete on table public.annotation_pages to authenticated;
grant insert (club_book_id, user_id, page_index, strokes, revision) on table public.annotation_pages to authenticated;
grant update (strokes, revision) on table public.annotation_pages to authenticated;

grant select on table public.page_annotation_summaries to authenticated;
