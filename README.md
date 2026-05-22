# PivoCloud Demo — Mini CRM

Mini CRM générique servant de démo live pour le workshop ANPT. L'application
est un prétexte fonctionnel ; le sujet réellement démontré est la **résilience
d'une base PostgreSQL managée par PivoCloud** via le cycle backup → incident
→ restore opéré depuis l'UI PivoCloud.

Brief produit complet : voir [`MISSION.md`](./MISSION.md).

## Prérequis

- Node.js 20+ (testé sur 24)
- npm 10+
- Docker / Docker Compose (pour PostgreSQL local en dev)

## Démarrage local

```bash
# 1. Configurer la connection string
cp .env.example .env

# 2. Lancer PostgreSQL local
docker compose up -d postgres

# 3. Installer les dépendances
npm install

# 4. Lancer l'app
npm run dev
```

Ouvrir <http://localhost:3000>. La table `contacts` est créée
automatiquement au premier accès (bootstrap idempotent via
`lib/db/bootstrap.ts`).

Pour peupler la base manuellement en dev :

```bash
docker compose exec postgres psql -U pivocloud -d pivocloud_demo -c \
  "INSERT INTO contacts (name, email, phone)
   VALUES ('Alice', 'alice@example.com', '+213-555-01'),
          ('Bob',   'bob@example.com',   NULL);"
```

## Cible démo workshop

Pendant le workshop, remplacer la valeur de `DATABASE_URL` dans `.env`
par celle d'une instance PostgreSQL managée provisionnée depuis l'UI
PivoCloud. L'application est strictement identique — c'est tout l'intérêt
de la démo. Les opérations plateforme (provisioning, backup, restore)
sont effectuées dans l'UI PivoCloud, jamais dans l'app.

## Déploiement PivoCloud

L'app est packagée via le `Dockerfile` à la racine (build Next.js standalone
multi-stage, image Node 20 Alpine). PivoCloud PaaS lit ce Dockerfile pour
construire et déployer l'image. La seule variable d'environnement requise
au runtime est `DATABASE_URL`.

## Scope

L'app est une web app Next.js qui se connecte à PostgreSQL via
`DATABASE_URL`. Elle ne contient aucune logique de plateforme : ni
provisioning, ni backup, ni restore. Voir [`MISSION.md`](./MISSION.md)
pour la liste exhaustive des requirements et du hors-scope.

## Phases

| Phase | Contenu | Status |
|------:|---------|--------|
| 1 | Bootstrap & Read — Walking Skeleton (lecture des contacts) | done |
| 2 | CRUD complet — ajout / modif / suppression de contacts | done |
| 3 | Demo polish — esthétique PivoCloud, scénario E2E workshop | done |
| 4 | Visual polish workshop-grade CRM UI | in progress |

## Stack

- Next.js 15+ App Router (TypeScript strict)
- PostgreSQL via `pg` (node-postgres, sans ORM)
- Tailwind CSS v4
- Docker Compose pour PostgreSQL local en dev

## Commandes utiles

```bash
npm run dev       # dev server (http://localhost:3000)
npm run build     # production build
npm run lint      # eslint
npm run start     # production server (après build)

docker compose up -d postgres    # lancer PostgreSQL local
docker compose stop postgres     # arrêter
docker compose logs -f postgres  # suivre les logs
```
