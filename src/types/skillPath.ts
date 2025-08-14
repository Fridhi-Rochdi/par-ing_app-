// Types pour la structure du skill path
export interface Concept {
    title: string;
    videos: string[];
    resources: string[];
}

export interface Lesson {
    id: string;
    title: string;
    concepts: Concept[];
    lab_ngc: string;
    quiz: string;
    project: string;
}

export interface Module {
    id: string;
    name: string;
    objective: string;
    lessons: Lesson[];
}

export interface Unit {
    id: string;
    name: string;
    modules: Module[];
}

export interface SkillPath {
    units: Unit[];
}
