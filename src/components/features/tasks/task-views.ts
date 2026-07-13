export const TASK_VIEWS = ["lista", "kanban", "calendario", "semana"] as const;
export type TaskView = (typeof TASK_VIEWS)[number];

export const TASK_FILTERS = [
  { value: "hoje", label: "Hoje" },
  { value: "todas", label: "Todas" },
  { value: "pendentes", label: "Pendentes" },
  { value: "concluidas", label: "Concluídas" },
] as const;
export type TaskFilter = (typeof TASK_FILTERS)[number]["value"];

export function parseTaskView(value: string | undefined): TaskView {
  return TASK_VIEWS.includes(value as TaskView) ? (value as TaskView) : "lista";
}

export function parseTaskFilter(value: string | undefined): TaskFilter {
  return TASK_FILTERS.some((filter) => filter.value === value) ? (value as TaskFilter) : "hoje";
}
