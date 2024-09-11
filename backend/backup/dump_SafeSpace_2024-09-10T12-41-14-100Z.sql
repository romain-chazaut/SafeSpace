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

--
-- Name: backups; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA backups;


ALTER SCHEMA backups OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: backup; Type: TABLE; Schema: backups; Owner: postgres
--

CREATE TABLE backups.backup (
);


ALTER TABLE backups.backup OWNER TO postgres;

--
-- Name: backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup (
    id integer NOT NULL,
    path character varying(255) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    action character varying(50) NOT NULL
);


ALTER TABLE public.backup OWNER TO postgres;

--
-- Name: TABLE backup; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.backup IS 'Table pour stocker les informations des sauvegardes';


--
-- Name: COLUMN backup.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.backup.id IS 'Identifiant unique auto-incrémenté pour chaque sauvegarde';


--
-- Name: COLUMN backup.path; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.backup.path IS 'Chemin du fichier de sauvegarde';


--
-- Name: COLUMN backup."timestamp"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.backup."timestamp" IS 'Date et heure de la sauvegarde';


--
-- Name: COLUMN backup.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.backup.action IS 'Type d''action effectuée (par exemple: création, restauration, suppression)';


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
-- Name: backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backups (
    id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.backups OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backups_id_seq OWNER TO postgres;

--
-- Name: backups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backups_id_seq OWNED BY public.backups.id;


--
-- Name: backup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup ALTER COLUMN id SET DEFAULT nextval('public.backup_id_seq'::regclass);


--
-- Name: backups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups ALTER COLUMN id SET DEFAULT nextval('public.backups_id_seq'::regclass);


--
-- Data for Name: backup; Type: TABLE DATA; Schema: backups; Owner: postgres
--

COPY backups.backup  FROM stdin;
\.


--
-- Data for Name: backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup (id, path, "timestamp", action) FROM stdin;
1	/path/to/backup1.sql	2024-09-10 09:30:01.797115+00	create
2	/path/to/backup2.sql	2024-09-10 09:30:01.797115+00	restore
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, content, created_at) FROM stdin;
\.


--
-- Name: backup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_id_seq', 2, true);


--
-- Name: backups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backups_id_seq', 1, false);


--
-- Name: backup backup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup
    ADD CONSTRAINT backup_pkey PRIMARY KEY (id);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: idx_backup_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_backup_action ON public.backup USING btree (action);


--
-- Name: idx_backup_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_backup_timestamp ON public.backup USING btree ("timestamp");


--
-- PostgreSQL database dump complete
--

