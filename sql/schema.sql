-- KM.ai application schema
-- Run with: psql -d km_api -f sql/schema.sql

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'teacher',
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subject text not null,
  description text,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null,
  email text not null,
  student_code text not null,
  gender text,
  phone text,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_code)
);

create table if not exists materials (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  description text,
  content text,
  files jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  date_start timestamptz,
  date_end timestamptz,
  created_by uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists exams (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  description text,
  exam_date date not null default current_date,
  duration integer not null default 90,
  status text not null default 'pending',
  unique_per_student boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists exam_questions (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  exam_content text not null,
  created_at timestamptz not null default now()
);

create table if not exists exam_students (
  id uuid primary key default uuid_generate_v4(),
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  exam_question_id uuid references exam_questions(id) on delete set null,
  status text not null default 'not-submitted',
  answer_files jsonb not null default '[]'::jsonb,
  score integer,
  feedback text,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (exam_id, student_id)
);

create table if not exists student_profiles (
  id uuid primary key references students(id) on delete cascade,
  name text not null,
  overview text not null,
  strengths text[] not null default array[]::text[],
  challenges text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create table if not exists student_exam_summaries (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  summary text not null,
  details text not null,
  created_at timestamptz not null default now()
);
