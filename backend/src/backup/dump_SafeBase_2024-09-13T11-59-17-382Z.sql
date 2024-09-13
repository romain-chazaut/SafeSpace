--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+1)

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
-- Name: backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup (
    id integer NOT NULL,
    path character varying(255) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    action character varying(50) NOT NULL,
    name_database character varying(100) NOT NULL
);


ALTER TABLE public.backup OWNER TO postgres;

--
-- Name: backup_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup_history (
    id integer NOT NULL,
    backup_id integer,
    path text NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    action character varying(50) NOT NULL,
    database_name text NOT NULL
);


ALTER TABLE public.backup_history OWNER TO postgres;

--
-- Name: backup_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backup_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_history_id_seq OWNER TO postgres;

--
-- Name: backup_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backup_history_id_seq OWNED BY public.backup_history.id;


--
-- Name: backup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_id_seq OWNER TO postgres;

--
-- Name: backup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backup_id_seq OWNED BY public.backup.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: backup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup ALTER COLUMN id SET DEFAULT nextval('public.backup_id_seq'::regclass);


--
-- Name: backup_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_history ALTER COLUMN id SET DEFAULT nextval('public.backup_history_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup (id, path, "timestamp", action, name_database) FROM stdin;
1	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-11T14-33-21-614Z.sql	2024-09-11 16:33:21.832	save	postgres
2	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T08-52-47-228Z.sql	2024-09-12 10:52:47.567	save	postgres
3	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T09-02-01-925Z.sql	2024-09-12 11:02:02.172	save	postgres
4	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T09-05-32-248Z.sql	2024-09-12 11:05:32.466	save	postgres
5	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_test_db_2024-09-12T09-22-04-139Z.sql	2024-09-12 11:22:04.399	save	test_db
6	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T09-25-36-036Z.sql	2024-09-12 11:25:36.309	save	laBaseDesBases
7	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T11-48-10-062Z.sql	2024-09-12 13:48:10.437	save	laBaseDesBases
8	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-09-53-380Z.sql	2024-09-12 14:09:53.607	save	laBaseDesBases
9	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-12-37-226Z.sql	2024-09-12 14:12:37.442	save	laBaseDesBases
10	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-12-49-704Z.sql	2024-09-12 14:12:49.835	save	laBaseDesBases
11	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-15-22-944Z.sql	2024-09-12 14:15:23.218	save	laBaseDesBases
12	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-49-58-753Z.sql	2024-09-12 14:49:58.988	save	laBaseDesBases
13	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-50-43-017Z.sql	2024-09-12 14:50:43.227	save	laBaseDesBases
14	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-54-36-632Z.sql	2024-09-12 14:54:36.934	save	laBaseDesBases
15	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-55-13-756Z.sql	2024-09-12 14:55:14.015	save	laBaseDesBases
16	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-56-11-451Z.sql	2024-09-12 14:56:11.738	save	laBaseDesBases
17	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-57-02-694Z.sql	2024-09-12 14:57:02.96	save	laBaseDesBases
18	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-57-20-214Z.sql	2024-09-12 14:57:20.465	save	laBaseDesBases
19	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T12-58-36-128Z.sql	2024-09-12 14:58:36.41	save	laBaseDesBases
20	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-00-01-724Z.sql	2024-09-12 15:00:02.015	save	laBaseDesBases
21	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-00-40-073Z.sql	2024-09-12 15:00:40.292	save	laBaseDesBases
22	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-01-44-915Z.sql	2024-09-12 15:01:45.166	save	laBaseDesBases
23	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-02-56-322Z.sql	2024-09-12 15:02:56.556	save	laBaseDesBases
24	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-06-59-961Z.sql	2024-09-12 15:07:00.184	save	laBaseDesBases
25	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-07-11-765Z.sql	2024-09-12 15:07:11.898	save	laBaseDesBases
26	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-10-19-278Z.sql	2024-09-12 15:10:19.491	save	laBaseDesBases
27	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-11-04-493Z.sql	2024-09-12 15:11:04.704	save	laBaseDesBases
28	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-13-23-213Z.sql	2024-09-12 15:13:23.505	save	laBaseDesBases
29	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-14-34-433Z.sql	2024-09-12 15:14:34.64	save	laBaseDesBases
30	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_laBaseDesBases_2024-09-12T13-51-37-769Z.sql	2024-09-12 15:51:38.06	save	laBaseDesBases
31	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_test_db_2024-09-12T13-53-11-859Z.sql	2024-09-12 15:53:12.035	save	test_db
32	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_test_db_2024-09-12T14-00-07-465Z.sql	2024-09-12 16:00:07.738	save	test_db
33	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-03-51-537Z.sql	2024-09-12 16:03:51.826	save	SafeBase
34	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-08-16-229Z.sql	2024-09-12 16:08:16.5	save	SafeBase
35	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-12-57-979Z.sql	2024-09-12 16:12:58.211	save	postgres
36	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-13-06-240Z.sql	2024-09-12 16:13:06.378	save	postgres
37	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-15-07-928Z.sql	2024-09-12 16:15:08.129	save	postgres
38	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-20-41-182Z.sql	2024-09-12 16:20:41.38	save	postgres
39	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-25-10-834Z.sql	2024-09-12 16:25:11.069	save	postgres
40	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-27-11-178Z.sql	2024-09-12 16:27:11.491	save	postgres
41	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-27-14-197Z.sql	2024-09-12 16:27:14.336	save	postgres
42	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-29-55-999Z.sql	2024-09-12 16:29:56.215	save	postgres
43	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-29-57-030Z.sql	2024-09-12 16:29:57.176	save	postgres
44	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-29-57-814Z.sql	2024-09-12 16:29:57.962	save	postgres
45	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-32-14-358Z.sql	2024-09-12 16:32:14.624	save	postgres
46	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-32-45-164Z.sql	2024-09-12 16:32:45.402	save	postgres
47	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_postgres_2024-09-12T14-33-05-173Z.sql	2024-09-12 16:33:05.409	save	postgres
48	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-33-16-884Z.sql	2024-09-12 16:33:17.029	save	SafeBase
49	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-34-40-547Z.sql	2024-09-12 16:34:40.816	save	SafeBase
50	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-34-59-544Z.sql	2024-09-12 16:34:59.732	save	SafeBase
51	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-55-03-670Z.sql	2024-09-12 16:55:03.975	save	SafeBase
52	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-57-22-839Z.sql	2024-09-12 16:57:23.105	save	SafeBase
53	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-57-36-372Z.sql	2024-09-12 16:57:36.606	save	SafeBase
54	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-12T14-58-27-938Z.sql	2024-09-12 16:58:28.202	save	SafeBase
84	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-13T09-32-00-992Z.sql	2024-09-13 11:32:01.373	save	SafeBase
85	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-13T09-33-10-838Z.sql	2024-09-13 11:33:11.056	save	SafeBase
86	/Users/romainchazaut/SafeSpace/backend/src/backup/dump_SafeBase_2024-09-13T09-55-04-381Z.sql	2024-09-13 11:55:04.617	save	SafeBase
\.


--
-- Data for Name: backup_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup_history (id, backup_id, path, "timestamp", action, database_name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password) FROM stdin;
1	johndoe	password123
2	janedoe	securepass456
3	mike91	password789
4	emily_smith	mypassword111
5	robert_brown	robert123
6	lucie_martin	lucie2024
7	nicolas_75	nicolas_secure
8	amelie_c	amelie_secret
9	pierre.l	pierrepass09
10	julie_v	julie_securepass
11	chris_moore	chrispw321
12	anna.b	annapass456
13	maxime23	max2023pass
14	thomas_r	thomaspass890
15	laura_d	laura_secret123
\.


--
-- Name: backup_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_history_id_seq', 1, false);


--
-- Name: backup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_id_seq', 86, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: backup_history backup_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_history
    ADD CONSTRAINT backup_history_pkey PRIMARY KEY (id);


--
-- Name: backup backup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup
    ADD CONSTRAINT backup_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: backup_history backup_history_backup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_history
    ADD CONSTRAINT backup_history_backup_id_fkey FOREIGN KEY (backup_id) REFERENCES public.backup(id);


--
-- PostgreSQL database dump complete
--

