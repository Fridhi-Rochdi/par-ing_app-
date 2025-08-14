# Skill Path Parser

Une application Next.js simple pour parser et analyser des skill paths selon un algorithme spécifique.

## Fonctionnalités

- ✅ Interface simple avec zone de texte pour saisir le skill path
- ✅ Parsing en temps réel selon l'algorithme fourni
- ✅ Affichage du résultat JSON formaté
- ✅ Statistiques (nombre d'units, modules, concepts)
- ✅ Bouton pour copier le JSON résultant
- ✅ Exemple de données inclus
- ✅ Interface responsive avec Tailwind CSS

## Comment utiliser

1. **Démarrer l'application** :
   ```bash
   cd skill-path-parser
   npm run dev
   ```

2. **Utiliser l'interface** :
   - Collez votre skill path dans la zone de texte à gauche
   - Cliquez sur "Parser" pour analyser le contenu
   - Le résultat JSON apparaîtra à droite
   - Utilisez "Exemple" pour tester avec des données de démonstration

## Format du Skill Path attendu

L'algorithme reconnaît ces structures :

### Units
```
Unit 1: Nom de l'unité
Unit 2: Autre unité
```

### Modules
```
Module 1.1: Nom du module
Module 2.1: Autre module
```

### Sections
- `Concepts` ou `Lessons`
- `Quizzes`
- `Projects style scrimba`
- `Projects style ngc`
- `Bac correction style`

### Éléments dans les sections
- `Scrimba video: Titre de la vidéo`
- `ngc practice lab: Titre du lab`
- `Questions: Texte de la question`
- `Task: Description de la tâche`
- `scrimba style video: Titre de la vidéo`

## Exemple de skill path

```
Unit 1: Introduction to Programming
Module 1.1: Getting Started
Concepts
Scrimba video: Introduction to Programming
ngc practice lab: Setup Development Environment
Quizzes
Questions: What is programming?
Projects style scrimba
Scrimba video: Build your first app
Projects style ngc
Task: Create a simple calculator
Bac correction style
scrimba style video: Review and corrections
```

## Structure du JSON résultant

```json
{
  "units": [
    {
      "id": "1",
      "name": "Introduction to Programming",
      "modules": [
        {
          "id": "1.1",
          "name": "Getting Started",
          "sections": {
            "concepts": [
              { "type": "scrimba", "title": "Introduction to Programming" },
              { "type": "ngc_lab", "title": "Setup Development Environment" }
            ],
            "quizzes": "What is programming?",
            "projects_scrimba": ["Build your first app"],
            "projects_ngc": ["Create a simple calculator"],
            "bac_correction": "Review and corrections"
          }
        }
      ]
    }
  ]
}
```

## Technologies utilisées

- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **React Hooks** - État local (useState)

## Développement

```bash
# Installation des dépendances
npm install

# Démarrer en mode développement
npm run dev

# Build pour production
npm run build
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)
