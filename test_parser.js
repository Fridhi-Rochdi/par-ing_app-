// Test rapide du parser
const { parseSkillPath } = require('./src/utils/skillPathParser.ts');

const testInput = `# Unité 2 : Programmation Orientée Objet (OOP)

### Module 2.1 : Classes and Objects

Objectif : Comprendre et créer des classes et objets en Java.

- Leçon 1 : Introduction à l'OOP
    - Concepts :
        - Concepts de base : classes, objets, instances
            - Vidéo Scrimba : *What is OOP? Objects and Classes Explained*
            - Ressources :
                - https://www.w3schools.com/java/java_oop.asp
        - Déclaration de classes et création d'objets
            - Vidéo Scrimba : *Creating Classes in Java*
    - Labo NGC : Créer une classe Person avec des attributs.
    - Quiz : 2 QCM (Classes vs. objets, méthodes).`;

try {
    const result = parseSkillPath(testInput);
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.error('Erreur:', error.message);
}
