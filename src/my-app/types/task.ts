export type Priority = 'low' | 'medium' | 'high';

// Contract present task
export type Task = {
    id: number,
    title: string,
    priority: Priority
}