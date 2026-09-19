-- ==============================================================================
-- AURUM VAULT - Complete Supabase PostgreSQL Schema & Security Infrastructure
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER PROFILES
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text unique,
  avatar text default 'beam-2',
  avatar_type text default 'beam',
  avatar_color text default 'orange',
  plan text default 'AURUM Pro',
  currency_preference text default 'TRY',
  is_balance_hidden boolean default false,
  auto_refresh_enabled boolean default true,
  refresh_interval_seconds integer default 45,
  performance_period text default 'daily',
  theme text default 'aurum-gold',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ASSET HOLDINGS (Base Precious Metals & Currencies)
create table if not exists public.holdings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  gram_gold numeric default 0,
  quarter_gold numeric default 0,
  half_gold numeric default 0,
  full_gold numeric default 0,
  usd numeric default 0,
  eur numeric default 0,
  try_cash numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. CUSTOM ASSETS (User-defined silver, stocks, funds)
create table if not exists public.custom_assets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  name text not null,
  symbol text not null,
  category text default 'other',
  quantity numeric default 0,
  buy_price numeric default 0,
  current_price numeric default 0,
  image_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. FINANCIAL ACCOUNTS (Bank & Cash Wallets)
create table if not exists public.accounts (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'bank',
  bank_name text,
  initial_balance numeric default 0,
  balance numeric default 0,
  currency text default 'TRY',
  icon text default 'Building2',
  color text default '#E11D48',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. CASHFLOW CATEGORIES
create table if not exists public.categories (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'income' | 'expense'
  icon text default 'Circle',
  color text default '#F59E0B',
  active boolean default true,
  created_at timestamptz default now()
);

-- 6. TRANSACTIONS (Trades, Incomes, Expenses, Transfers)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  asset_key text,
  quantity numeric,
  type text not null, -- 'buy' | 'sell' | 'income' | 'expense' | 'transfer'
  unit_price numeric,
  total_value numeric not null default 0,
  purchase_price numeric,
  date text,
  timestamp bigint,
  transaction_date text,
  transaction_time text,
  category text,
  category_id text,
  title text,
  account_id text,
  target_account_id text,
  status text default 'completed',
  note text,
  market_price_at_transaction numeric,
  created_at timestamptz default now()
);

-- 7. RECURRING TRANSACTIONS (Salary, Subscriptions, Installments)
create table if not exists public.recurring_transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'income' | 'expense'
  name text not null,
  category_id text,
  amount numeric not null default 0,
  frequency text default 'monthly',
  day_of_month integer,
  account_id text,
  start_date text,
  next_occurrence text,
  installment_current integer,
  installment_total integer,
  installment_remaining integer,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. SAVINGS GOALS
create table if not exists public.goals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null default 0,
  current_amount numeric default 0,
  target_date text,
  icon text default '🎯',
  image_url text,
  category text default 'other',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. NOTES & TODOS
create table if not exists public.notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  type text default 'note', -- 'note' | 'todo'
  tags text[] default '{}',
  completed boolean default false,
  priority text default 'normal',
  due_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. USER DEVICES & ACTIVE SESSIONS
create table if not exists public.user_devices (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  device_name text not null,
  device_type text not null default 'desktop', -- 'desktop' | 'mobile' | 'tablet'
  browser text not null default 'Modern Browser',
  location text default 'Türkiye',
  ip_address text,
  last_active_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.user_profiles enable row level security;
alter table public.holdings enable row level security;
alter table public.custom_assets enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.goals enable row level security;
alter table public.notes enable row level security;
alter table public.user_devices enable row level security;

-- user_profiles policies
drop policy if exists "Users can manage their own profile" on public.user_profiles;
create policy "Users can manage their own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- holdings policies
drop policy if exists "Users can manage their own holdings" on public.holdings;
create policy "Users can manage their own holdings"
  on public.holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- custom_assets policies
drop policy if exists "Users can manage their own custom assets" on public.custom_assets;
create policy "Users can manage their own custom assets"
  on public.custom_assets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- accounts policies
drop policy if exists "Users can manage their own accounts" on public.accounts;
create policy "Users can manage their own accounts"
  on public.accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- categories policies
drop policy if exists "Users can manage their own categories" on public.categories;
create policy "Users can manage their own categories"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- transactions policies
drop policy if exists "Users can manage their own transactions" on public.transactions;
create policy "Users can manage their own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- recurring_transactions policies
drop policy if exists "Users can manage their own recurring transactions" on public.recurring_transactions;
create policy "Users can manage their own recurring transactions"
  on public.recurring_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- goals policies
drop policy if exists "Users can manage their own goals" on public.goals;
create policy "Users can manage their own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- notes policies
drop policy if exists "Users can manage their own notes" on public.notes;
create policy "Users can manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_devices policies
drop policy if exists "Users can manage their own devices" on public.user_devices;
create policy "Users can manage their own devices"
  on public.user_devices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC NEW USER INITIALIZATION TRIGGER
-- When a user registers (Email, Google, Apple), automatically:
-- 1. Create a user_profiles record with name, email, avatar
-- 2. Create an empty holdings record with 0 balances
-- 3. Create default cashflow categories
-- 4. Create default "Nakit Cüzdan" account
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_full_name text;
  clean_username text;
  avatar_url_val text;
begin
  raw_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  clean_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  avatar_url_val := coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture');

  -- 1. Profile
  insert into public.user_profiles (
    id,
    email,
    full_name,
    username,
    avatar,
    avatar_type,
    avatar_color,
    plan,
    currency_preference,
    onboarding_completed
  ) values (
    new.id,
    new.email,
    raw_full_name,
    clean_username || '_' || substr(new.id::text, 1, 4),
    coalesce(avatar_url_val, 'beam-2'),
    case when avatar_url_val is not null then 'custom' else 'beam' end,
    'orange',
    'AURUM Pro',
    'TRY',
    false
  ) on conflict (id) do nothing;

  -- 2. Zero Holdings
  insert into public.holdings (
    user_id,
    gram_gold,
    quarter_gold,
    half_gold,
    full_gold,
    usd,
    eur,
    try_cash
  ) values (
    new.id,
    0, 0, 0, 0, 0, 0, 0
  ) on conflict (user_id) do nothing;

  -- 3. Default Cash Account
  insert into public.accounts (
    id,
    user_id,
    name,
    type,
    initial_balance,
    balance,
    currency,
    icon,
    color
  ) values (
    'acc-cash-' || substr(new.id::text, 1, 8),
    new.id,
    'Nakit Cüzdan',
    'cash',
    0,
    0,
    'TRY',
    'Banknote',
    '#10B981'
  ) on conflict (id) do nothing;

  -- 4. Essential Standard Categories
  insert into public.categories (id, user_id, name, type, icon, color) values
    ('cat-sal-' || substr(new.id::text, 1, 8), new.id, 'Maaş', 'income', 'Briefcase', '#10B981'),
    ('cat-side-' || substr(new.id::text, 1, 8), new.id, 'Ek Gelir', 'income', 'Coins', '#38BDF8'),
    ('cat-rent-' || substr(new.id::text, 1, 8), new.id, 'Kira', 'expense', 'Home', '#EF4444'),
    ('cat-groc-' || substr(new.id::text, 1, 8), new.id, 'Market', 'expense', 'ShoppingCart', '#F97316'),
    ('cat-bill-' || substr(new.id::text, 1, 8), new.id, 'Faturalar', 'expense', 'Receipt', '#F59E0B'),
    ('cat-trans-' || substr(new.id::text, 1, 8), new.id, 'Ulaşım', 'expense', 'Bus', '#8B5CF6'),
    ('cat-oth-' || substr(new.id::text, 1, 8), new.id, 'Diğer Gider', 'expense', 'MoreHorizontal', '#64748B')
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
