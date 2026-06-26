# IMA Studio du SCOP

Plateforme web moderne de réservation de studio et de formations, développée avec React, Tailwind CSS et Firebase.

## Prérequis

- Node.js (version 18 ou supérieure)
- Un compte Firebase

## Installation du projet

1. Clonez ce dépôt GitHub.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

## Configuration de Firebase

1. Créez un projet sur la [Console Firebase](https://console.firebase.google.com/).
2. Activez **Firestore Database** et **Authentication** (Email/Mot de passe).
3. Copiez le contenu du fichier `firestore.rules` inclus dans ce projet et collez-le dans l'onglet **Règles** de votre base de données Firestore pour sécuriser les accès.
4. Récupérez vos clés de configuration Firebase.

## Variables d'environnement

Ce projet utilise des variables d'environnement pour la configuration. 
Dans un environnement classique, créez un fichier `.env` à la racine :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

> **Note :** Dans le contexte de Google AI Studio, la configuration Firebase a été initialisée et injectée directement dans `src/lib/firebase.ts`.

## Étapes de déploiement sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com/) et connectez-le à votre compte GitHub.
2. Cliquez sur **Add New...** > **Project** et importez le dépôt GitHub d'IMA Studio.
3. Dans la section **Environment Variables** de Vercel, ajoutez toutes les variables définies précédemment (si vous utilisez le fichier `.env`).
4. Le **Framework Preset** devrait être automatiquement détecté comme **Vite**.
5. Cliquez sur **Deploy**. Votre application sera en ligne en quelques minutes !
