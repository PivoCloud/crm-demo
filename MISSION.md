# MISSION — PivoCloud Demo

**Statut**: Brief produit officiel.
**Source de vérité GBrain**: `projects/pivocloud-demo`.

## Mission

Construire un **mini CRM générique** servant de démo live pour le workshop ANPT.

- CRM standalone
- Pas lié fonctionnellement aux features PivoCloud
- Hébergé localement
- Pas de deploy applicatif
- Démo compréhensible en moins de 8 minutes

## Objectif secondaire — détecter les lacunes GBrain

Ce développement sert aussi à identifier ce que GBrain ne sait pas encore sur PivoCloud.

Lacune probable actuelle : GBrain ne connaît pas encore assez précisément les workflows DBaaS PivoCloud :

- provisionner une base PostgreSQL via l’interface utilisateur PivoCloud
- faire un backup via l’interface utilisateur PivoCloud
- faire un restore via l’interface utilisateur PivoCloud

Ces gaps doivent être notés et remontés, mais **ne doivent pas élargir le scope du développement applicatif**.

## Démo workshop — opérations via PivoCloud UI

Pendant le workshop, toute la partie plateforme / DBaaS doit être démontrée via l’interface utilisateur PivoCloud :

1. Créer/provisionner une base PostgreSQL depuis l’UI PivoCloud
2. Connecter l’application CRM à cette base
3. Faire un backup depuis l’UI PivoCloud
4. Modifier/supprimer des données dans le CRM
5. Faire un restore depuis l’UI PivoCloud
6. Montrer que l’application retrouve l’état restauré

Important : l’application CRM **ne doit pas implémenter elle-même** les fonctions PivoCloud de provisioning, backup ou restore. Elle sert à produire/visualiser les données métier.

## Objectif narratif

Montrer qu’une application métier peut retrouver un état sain après erreur humaine ou incident grâce à une base PostgreSQL managée par PivoCloud.

Le CRM est un prétexte. La vraie démonstration est :

```text
je crée une DB dans PivoCloud → j’ajoute des contacts → backup dans PivoCloud UI → je casse/modifie → restore dans PivoCloud UI → l’app retrouve les données
```

## Scope de développement applicatif

Le développement concerne uniquement l’application demo :

- afficher des contacts
- ajouter des contacts
- modifier/supprimer des contacts si utile pour rendre le restore visible
- se connecter à PostgreSQL via `DATABASE_URL`
- fournir une UX présentable pour la démo

Hors scope pour l’application :

- provisionner une DB PivoCloud
- faire un backup PivoCloud
- faire un restore PivoCloud
- appeler une API PivoCloud de gestion DBaaS
- simuler PivoCloud dans l’application

## Features V1

### 1. Liste de contacts

Afficher une liste de contacts avec :

- nom
- email
- téléphone

### 2. Ajouter un contact

Formulaire simple :

- nom
- email
- téléphone

### 3. Modifier / supprimer un contact

Fonctions utiles pour démontrer l’incident avant restore :

- modifier un contact
- supprimer un contact

Ces actions sont utiles seulement pour rendre visible le scénario : état OK → casse → restore.

## Design

- Esthétique PivoCloud : propre, moderne, produit pro 2026
- Couleurs / typo / vibe PivoCloud OK
- Contenu neutre : ne pas transformer le CRM en copie de PivoCloud
- Interface simple, lisible en présentation live

## Stack

- Next.js App Router
- Backend léger acceptable : Next.js Server Actions / API routes
- PostgreSQL via `DATABASE_URL`
- Pour test local : PostgreSQL local autorisé
- Pour demo cible : PivoCloud managed PostgreSQL
- Docker Compose possible pour lancer l’app et/ou une DB Postgres locale de test
- Pas de Go dans ce repo
- Pas de paiement
- Pas d’auth

## Méthodologie obligatoire

Utiliser GSD / Spec-Driven Development.

Commande d’installation locale :

```bash
npx get-shit-done-cc@latest --claude --local --profile=standard
```

Structure GSD attendue après installation :

```text
.planning/
├── PROJECT.md
├── REQUIREMENTS.md
├── ROADMAP.md
└── STATE.md
```

Syntaxe GSD locale vérifiée : utiliser le format colon-form :

```text
/gsd:new-project
/gsd:progress --next
/gsd:plan-phase 1
/gsd:execute-phase 1
/gsd:verify-work 1
```

Règles :

- Lire GBrain avant d’écrire les specs
- Spec avant code
- Découper en phases courtes
- Critères d’acceptation observables
- `STATE.md` mis à jour à chaque phase

## Critères d’acceptation V1

1. L’app démarre localement
2. Page liste contacts accessible
3. Connexion PostgreSQL via `DATABASE_URL`
4. Ajout d’un contact fonctionnel
5. Modification/suppression d’un contact fonctionnelle
6. Après restore DB côté PivoCloud/local Postgres, l’app reflète l’état restauré
7. Pas d’erreur console évidente
8. UX présentable en workshop

## Hors périmètre

- Authentification
- Paiement
- Multi-tenant
- Cloud réel côté application
- Déploiement applicatif
- Intégration avec le vrai repo `~/dev/PivoCloud/`
- Implémenter le backup/restore dans l’app CRM
- Informations internes d’orchestration, de reporting, de prompts ou de hiérarchie opérationnelle
