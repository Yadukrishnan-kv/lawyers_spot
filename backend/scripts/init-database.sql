-- Run this in pgAdmin Query Tool (connected as postgres superuser)
-- Creates the LawyerSpot database user and database

CREATE USER lawyerspot WITH PASSWORD 'lawyerspot';

CREATE DATABASE lawyerspot OWNER lawyerspot;

GRANT ALL PRIVILEGES ON DATABASE lawyerspot TO lawyerspot;
