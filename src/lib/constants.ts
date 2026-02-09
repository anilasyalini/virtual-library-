export const COURSES = {
    'B.Tech': ['CSE', 'ECE', 'ME', 'CE', 'EE'],
    'MCA': ['Cloud Computing', 'AI', 'Data Science', 'Cyber Security'],
    'M.Tech': ['CSE', 'VLSI', 'Power Systems'],
    'BCA': ['General', 'AI', 'Data Science'],
} as const;

export type CourseType = keyof typeof COURSES;
export type SpecializationType<T extends CourseType> = (typeof COURSES)[T][number];

export const ALL_COURSES = Object.keys(COURSES) as CourseType[];
