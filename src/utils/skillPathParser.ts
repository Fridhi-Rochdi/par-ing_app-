import { SkillPath, Unit, Module, Lesson, Concept } from '@/types/skillPath';

export function parseSkillPath(text: string, forceBacLevel: boolean = false): SkillPath {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");

    // Détecter si c'est un skill path de niveau bac (automatique ou forcé par l'utilisateur)
    const isBacLevel = forceBacLevel || /bac/i.test(text);

    const skillPath: SkillPath = { units: [] };
    let currentUnit: Unit | null = null;
    let currentModule: Module | null = null;
    let currentLesson: Lesson | null = null;
    let currentConcept: Concept | null = null;
    let isInConcepts = false;

    for (let line of lines) {
        const originalLine = line;
        line = line.replace(/\*\*/g, "").trim();

        // Détection Unit avec # Unité/Unit X : Name, ## **Unité/Unit X : Name** OU texte brut "Unité/Unit X :"
        if (/^#+\s*\*?\*?(Unité?|Unit)\s+\d+/i.test(originalLine) || /^(Unité?|Unit)\s+\d+\s*:/i.test(line)) {
            const match = line.match(/(Unité?|Unit)\s+(\d+)\s*:\s*(.+)/i);
            if (match) {
                currentUnit = { 
                    id: match[2].trim(), 
                    name: match[3].trim(), 
                    modules: [] 
                };
                skillPath.units.push(currentUnit);
                currentModule = null;
                currentLesson = null;
                isInConcepts = false;
            }
            continue;
        }

        // Détection Module avec ### **Module X.Y : Name** OU texte brut "Module X.Y :"
        if (/^###\s*\*?\*?Module\s+\d+\.\d+/i.test(originalLine) || /^Module\s+\d+\.\d+\s*:/i.test(line)) {
            const match = line.match(/Module\s+(\d+\.\d+)\s*:\s*(.+)/i);
            if (match) {
                // Si pas d'unité courante, créer une unité par défaut
                if (!currentUnit) {
                    const unitId = match[1].split('.')[0]; // Prendre la partie avant le point
                    currentUnit = {
                        id: unitId,
                        name: `Unit ${unitId}`,
                        modules: []
                    };
                    skillPath.units.push(currentUnit);
                }
                
                currentModule = {
                    id: match[1].trim(),
                    name: match[2].trim(),
                    objective: "",
                    lessons: []
                };
                currentUnit.modules.push(currentModule);
                currentLesson = null;
                isInConcepts = false;
            }
            continue;
        }

        // Détection des sections spéciales (Objectifs, Leçons, Ressources, Labs, Quiz, etc.)
        if (/^\*?\*?Objectifs?\*?\*?\s*:/i.test(line) && currentModule) {
            const match = line.match(/Objectifs?\*?\*?\s*:\s*(.+)/i);
            if (match) {
                currentModule.objective = match[1].trim();
            }
            continue;
        }

        // Gestion des sections comme "Leçons :", "Labs :", "Quiz :", etc.
        if (/^\*?\*?(Leçons?|Labs?|Quiz|Mini-projet|Projet)\*?\*?\s*:/i.test(line) && currentModule) {
            const sectionType = line.match(/^\*?\*?(Leçons?|Labs?|Quiz|Mini-projet|Projet)\*?\*?\s*:/i)?.[1].toLowerCase();
            
            // Créer une leçon générique pour ces sections si pas de leçon courante
            if (!currentLesson) {
                currentLesson = {
                    id: "1",
                    title: `${currentModule.name} - Content`,
                    concepts: [],
                    lab_ngc: "",
                    quiz: "",
                    project: ""
                };
                
                currentModule.lessons.push(currentLesson);
            }

            // Traiter le contenu selon le type de section
            const content = line.replace(/^\*?\*?(Leçons?|Labs?|Quiz|Mini-projet|Projet)\*?\*?\s*:\s*/i, "").trim();
            
            if (sectionType?.includes("lab")) {
                currentLesson.lab_ngc = content || "Voir détails ci-dessous";
            } else if (sectionType?.includes("quiz")) {
                currentLesson.quiz = content || "Voir détails ci-dessous";
            } else if (sectionType?.includes("projet")) {
                currentLesson.project = content || "Voir détails ci-dessous";
            }
            
            isInConcepts = sectionType?.includes("leçon") || false;
            continue;
        }

        // Détection Objectif sans "Objectif :" explicite (ligne qui suit directement le module)
        if (currentModule && !currentModule.objective && !currentLesson && 
            !line.includes("Leçon") && !line.includes("Module") && !line.includes("Unité") &&
            line.length > 10 && !line.startsWith("-")) {
            currentModule.objective = line.trim();
            continue;
        }

        // Détection Leçon avec - **Leçon X : Name** OU texte brut "Leçon X :"
        if (/^-\s*\*?\*?Leçon\s+\d+/i.test(originalLine) || /^Leçon\s+\d+\s*:/i.test(line)) {
            const match = line.match(/Leçon\s+(\d+)\s*:\s*(.+)/i);
            if (match && currentModule) {
                currentLesson = {
                    id: match[1].trim(),
                    title: match[2].trim(),
                    concepts: [],
                    lab_ngc: "",
                    quiz: "",
                    project: ""
                };
                
                currentModule.lessons.push(currentLesson);
                isInConcepts = false;
            }
            continue;
        }

        // Détection section Concepts
        if (/^\s*-?\s*Concepts\s*:?/i.test(line)) {
            isInConcepts = true;
            continue;
        }

        // Détection des autres sections
        // Détection des sections spéciales avec meilleure gestion
        if (/^\s*-?\s*(Labo NGC|Quiz|Projet)\s*:/i.test(line)) {
            isInConcepts = false;
            const sectionType = line.match(/^\s*-?\s*(Labo NGC|Quiz|Projet)\s*:/i)?.[1].toLowerCase();
            const content = line.replace(/^\s*-?\s*(Labo NGC|Quiz|Projet)\s*:\s*/i, "").trim();
            
            if (currentLesson && sectionType) {
                if (sectionType.includes("labo")) {
                    currentLesson.lab_ngc = content || "Voir détails ci-dessous";
                } else if (sectionType.includes("quiz")) {
                    currentLesson.quiz = content || "Voir détails ci-dessous";
                } else if (sectionType.includes("projet")) {
                    currentLesson.project = content || "Voir détails ci-dessous";
                }
            }
            continue;
        }

        // Détection des corrections de type bac (seulement si c'est un skill path bac)
        if (isBacLevel && /^\s*-?\s*Correction\s+type\s+Bac\s*:/i.test(line) && currentLesson) {
            const match = line.match(/Correction\s+type\s+Bac\s*:\s*(.+)/i);
            if (match) {
                currentLesson.correction_bac = `${match[1].trim()} (videos style scrimba + challenge si nécessaire)`;
            }
            continue;
        }

        // Gestion spéciale pour les projets Scrimba et NGC sur des lignes séparées
        if (/^\s*-?\s*\*?\*?(Scrimba|NGC)\*?\*?\s*:/i.test(line) && currentLesson) {
            const match = line.match(/^\s*-?\s*\*?\*?(Scrimba|NGC)\*?\*?\s*:\s*[*]?(.+?)[*]?$/i);
            if (match) {
                const type = match[1];
                const content = match[2].trim();
                
                // Si c'est dans un contexte de projet, l'ajouter au projet
                if (currentLesson.project === "" || currentLesson.project === "Voir détails ci-dessous") {
                    currentLesson.project = `${type}: ${content}`;
                } else if (!currentLesson.project.includes(content)) {
                    currentLesson.project += ` | ${type}: ${content}`;
                }
            }
            continue;
        }

        // Gestion des éléments de labo sur des lignes séparées
        if (/^\s*-\s*(.+)/i.test(line) && currentLesson && 
            (currentLesson.lab_ngc === "Voir détails ci-dessous" || 
             currentLesson.quiz === "Voir détails ci-dessous" ||
             currentLesson.project === "Voir détails ci-dessous")) {
            
            const content = line.replace(/^\s*-\s*/, "").trim();
            
            // Déterminer dans quelle section on est en fonction du contexte récent
            if (currentLesson.lab_ngc === "Voir détails ci-dessous") {
                currentLesson.lab_ngc = currentLesson.lab_ngc === "Voir détails ci-dessous" ? content : currentLesson.lab_ngc + " | " + content;
            } else if (currentLesson.project === "Voir détails ci-dessous") {
                currentLesson.project = currentLesson.project === "Voir détails ci-dessous" ? content : currentLesson.project + " | " + content;
            }
            continue;
        }

        // Gestion spéciale pour "Projet final"
        if (/^\s*Projet final\s*:/i.test(line)) {
            isInConcepts = false;
            const match = line.match(/Projet final\s*:\s*(.+)/i);
            if (match && currentLesson) {
                currentLesson.project = match[1].trim();
            }
            continue;
        }

        // Parsing des concepts quand on est dans la section concepts/leçons
        if ((isInConcepts || /^-\s*(NGC|Scrimba|Article)/i.test(line)) && currentLesson) {
            // Vidéo NGC
            if (/NGC\s*(Video|Article)\s*:/i.test(line)) {
                const match = line.match(/NGC\s*(?:Video|Article)\s*:\s*[*]?(.+?)[*]?$/i);
                if (match) {
                    // Créer un concept générique si pas de concept courant
                    if (!currentConcept) {
                        currentConcept = {
                            title: "Course Content",
                            videos_scrimba: []
                        };
                        currentLesson.concepts.push(currentConcept);
                    }
                    currentConcept.videos_scrimba.push(`${match[1].trim()} (videos style scrimba + challenge si nécessaire)`);
                }
            }
            // Vidéo Scrimba (mais pas dans un contexte de projet)
            else if (/Scrimba\s*:/i.test(line) && !/\*.*\(/i.test(line)) {
                const match = line.match(/Scrimba\s*:\s*[*]?(.+?)[*]?$/i);
                if (match) {
                    if (!currentConcept) {
                        currentConcept = {
                            title: "Course Content", 
                            videos_scrimba: []
                        };
                        currentLesson.concepts.push(currentConcept);
                    }
                    currentConcept.videos_scrimba.push(`${match[1].trim()} (videos style scrimba + challenge si nécessaire)`);
                }
            }
            // Article
            else if (/Article\s*:/i.test(line)) {
                const match = line.match(/Article\s*:\s*[*]?(.+?)[*]?$/i);
                if (match) {
                    if (!currentConcept) {
                        currentConcept = {
                            title: "Course Content",
                            videos_scrimba: []
                        };
                        currentLesson.concepts.push(currentConcept);
                    }
                    currentConcept.videos_scrimba.push(`${match[1].trim()} (videos style scrimba + challenge si nécessaire)`);
                }
            }
            // Nouveau concept principal (détection améliorée)
            else if (!line.includes("Vidéo") && !line.includes("Ressources") && !line.includes("http") && 
                !line.includes("NGC") && !line.includes("Scrimba") && !line.includes("Article") &&
                !line.includes("Labo") && !line.includes("Quiz") && !line.includes("Projet") &&
                line.length > 5 && !line.includes(":") && 
                !/^\s*-\s*\*\*?(Scrimba|NGC)\*\*?\s*:/i.test(line)) {
                
                // Ne créer un nouveau concept que si ce n'est pas déjà fait
                currentConcept = {
                    title: line.replace(/^\s*-\s*/, "").trim(),
                    videos_scrimba: []
                };
                currentLesson.concepts.push(currentConcept);
            }
            // URLs ignorées (resources supprimées du JSON)
            // else if (/https?:\/\//.test(line) && currentConcept) {
            //     const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
            //     if (urlMatch) {
            //         // Resources supprimées du JSON de sortie
            //     }
            // }
        }

        // Réinitialiser isInConcepts si on rencontre une nouvelle section
        if ((/Labo NGC|Quiz|Projet/i.test(line) && !isInConcepts) || 
            /Leçon\s+\d+/i.test(line) || 
            /Module\s+\d+\.\d+/i.test(line)) {
            isInConcepts = false;
            currentConcept = null;
        }
    }

    return skillPath;
}
