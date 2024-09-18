--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+1)

-- Started on 2024-09-18 13:47:20 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16482)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    birth_date date,
    department character varying(50),
    salary numeric(10,2),
    hire_date date,
    is_active boolean DEFAULT true
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16481)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- TOC entry 3359 (class 0 OID 0)
-- Dependencies: 215
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;

  


--
-- TOC entry 3203 (class 2604 OID 16485)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 3353 (class 0 OID 16482)
-- Dependencies: 216
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, first_name, last_name, email, birth_date, department, salary, hire_date, is_active) FROM stdin;
1	John	Doe	john.doe@example.com	1985-03-15	IT	75000.00	2020-01-10	t
2	Jane	Smith	jane.smith@example.com	1990-07-22	HR	65000.00	2019-05-01	t
3	Michael	Johnson	michael.johnson@example.com	1988-11-30	Marketing	70000.00	2021-03-15	t
4	Emily	Brown	emily.brown@example.com	1992-09-05	Finance	68000.00	2018-11-20	t
5	David	Wilson	david.wilson@example.com	1987-06-18	Sales	72000.00	2017-08-01	t
6	Sarah	Taylor	sarah.taylor@example.com	1991-04-25	IT	71000.00	2022-02-14	t
7	Robert	Anderson	robert.anderson@example.com	1986-12-03	HR	67000.00	2019-09-30	t
8	Jennifer	Martinez	jennifer.martinez@example.com	1993-08-12	Marketing	69000.00	2020-07-15	t
9	William	Thomas	william.thomas@example.com	1989-02-28	Finance	73000.00	2018-04-01	f
10	Lisa	Garcia	lisa.garcia@example.com	1994-10-17	Sales	66000.00	2021-11-05	t
\.


--
-- TOC entry 3360 (class 0 OID 0)
-- Dependencies: 215
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 10, true);


--
-- TOC entry 3206 (class 2606 OID 16490)
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- TOC entry 3208 (class 2606 OID 16488)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


-- Completed on 2024-09-18 13:47:20 UTC

--
-- PostgreSQL database dump complete
--

