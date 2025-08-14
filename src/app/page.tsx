"use client";

import { useState } from "react";
import { parseSkillPath } from "@/utils/skillPathParser";
import { SkillPath, Unit, Module, Lesson } from "@/types/skillPath";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [parsedResult, setParsedResult] = useState<SkillPath | null>(null);
  const [error, setError] = useState("");

  const handleParse = () => {
    try {
      setError("");
      const result = parseSkillPath(inputText);
      setParsedResult(result);
    } catch (err) {
      setError("Erreur lors du parsing: " + (err as Error).message);
      setParsedResult(null);
    }
  };

  const handleClear = () => {
    setInputText("");
    setParsedResult(null);
    setError("");
  };

  const sampleInput = `# Unité 2 : Programmation Orientée Objet (OOP)

### Module 2.1 : Classes and Objects

Objectif : Comprendre et créer des classes et objets en Java.

- Leçon 1 : Introduction à l'OOP
    - Concepts :
        - Concepts de base : classes, objets, instances
            - Vidéo Scrimba : *What is OOP? Objects and Classes Explained*
            - Ressources :
                - https://www.w3schools.com/java/java_oop.asp
                - https://www.javatpoint.com/java-oops-concepts
        - Déclaration de classes et création d'objets
            - Vidéo Scrimba : *What is OOP? Objects and Classes Explained*
            - Ressources :
                - https://www.programiz.com/java-programming/class-objects
    - Labo NGC : Créer une classe Person avec des attributs.
    - Quiz : 2 QCM (Classes vs. objets, méthodes).
    - Projet : Aucun pour cette leçon.

- Leçon 2 : Création et utilisation de classes
    - Concepts :
        - Ajout de méthodes avec paramètres
            - Vidéo Scrimba : *Defining and Using Classes in Java*
            - Ressources :
                - https://www.javatpoint.com/parameterized-constructor
    - Labo NGC : Créer une classe Book avec des attributs.
    - Quiz : 2 QCM, 1 code à compléter.
    - Projet : Créer un gestionnaire de contacts.`;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Skill Path Parser
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Saisie du Skill Path
            </h2>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Collez votre skill path ici..."
              className="w-full h-96 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleParse}
                disabled={!inputText.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
              >
                Parser
              </button>
              
              <button
                onClick={handleClear}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Effacer
              </button>
              
              <button
                onClick={() => setInputText(sampleInput)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Exemple
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Résultat JSON
            </h2>
            
            {parsedResult ? (
              <div className="h-96 overflow-auto">
                <pre className="text-sm bg-gray-100 p-3 rounded-md overflow-x-auto text-black">
                  {JSON.stringify(parsedResult, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-black bg-gray-100 rounded-md">
                Le résultat apparaîtra ici après le parsing
              </div>
            )}
            
            {parsedResult && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(parsedResult, null, 2));
                  alert("JSON copié dans le presse-papiers!");
                }}
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Copier JSON
              </button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {parsedResult && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Statistiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded-md text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {parsedResult.units?.length || 0}
                </div>
                <div className="text-blue-800">Units</div>
              </div>
              <div className="bg-green-100 p-4 rounded-md text-center">
                <div className="text-2xl font-bold text-green-600">
                  {parsedResult.units?.reduce((total: number, unit: Unit) => 
                    total + (unit.modules?.length || 0), 0) || 0}
                </div>
                <div className="text-green-800">Modules</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-md text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {parsedResult.units?.reduce((total: number, unit: Unit) => 
                    total + (unit.modules?.reduce((moduleTotal: number, module: Module) => 
                      moduleTotal + (module.lessons?.reduce((lessonTotal: number, lesson: Lesson) => 
                        lessonTotal + (lesson.concepts?.length || 0), 0) || 0), 0) || 0), 0) || 0}
                </div>
                <div className="text-purple-800">Concepts</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
