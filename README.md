# Plateforme de Backup de Données avec PostgreSQL et pgAdmin

Ce projet configure un environnement Docker pour une plateforme de backup de données utilisant PostgreSQL comme système de gestion de base de données et pgAdmin comme interface d'administration.

## Prérequis

- Docker
- Docker Compose

## Configuration

Le fichier `docker-compose.yml` configure PostgreSQL et pgAdmin. PostgreSQL est configuré sans base de données prédéfinie pour permettre l'importation de bases de données externes.

## Démarrage

1. Ouvrez un terminal.
2. Naviguez vers le répertoire contenant le fichier `docker-compose.yml`.
3. Exécutez : docker-compose up -d


## Accès aux services

- **PostgreSQL** :
- Hôte : `localhost`
- Port : `5432`
- Utilisateur par défaut : `postgres`
- Mot de passe : `mysecretpassword`

- **pgAdmin** :
- URL : `http://localhost:8080`
- Email : `admin@example.com`
- Mot de passe : `adminpassword`

## Importation de bases de données

Pour importer une base de données :

1. Connectez-vous à pgAdmin.
2. Créez une nouvelle base de données.
3. Utilisez l'outil d'importation de pgAdmin pour charger votre dump SQL.

Alternativement, vous pouvez utiliser `pg_restore` ou `psql` en ligne de commande pour importer des données.

## Arrêt des services

Pour arrêter les services : docker-compose down


Pour arrêter et supprimer les volumes (effaçant toutes les données) : docker-compose down -v



## Remarques

- Les données de PostgreSQL sont persistées dans un volume Docker nommé `postgres_data`.
- Changez les mots de passe avant toute utilisation en production.

## Dépannage

En cas de problèmes :
1. Vérifiez l'installation de Docker et Docker Compose.
2. Assurez-vous qu'aucun autre service n'utilise les ports 5432 et 8080.
3. Consultez les logs avec `docker-compose logs`.