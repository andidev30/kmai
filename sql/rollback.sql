-- Rollback script for KM.ai schema
-- Run with: psql -d km_api -f sql/rollback.sql

drop table if exists student_profiles cascade;
drop table if exists exam_students cascade;
drop table if exists exam_questions cascade;
drop table if exists exam_materials cascade;
drop table if exists exams cascade;
drop table if exists materials cascade;
drop table if exists students cascade;
drop table if exists classes cascade;
drop table if exists users cascade;
