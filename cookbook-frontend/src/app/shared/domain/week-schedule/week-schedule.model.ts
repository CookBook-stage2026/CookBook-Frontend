import {RecipeSummary} from '@shared/domain/recipe';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

export interface DayScheduleResponse {
  readonly dayScheduleId: string;
  readonly recipeSummary: RecipeSummary;
  readonly day: DayOfWeek;
}

export interface WeekScheduleResponse {
  readonly id: string;
  readonly days: DayScheduleResponse[];
}

export interface CreateDayScheduleRequest {
  readonly recipeId: string;
  readonly day: DayOfWeek;
}

export interface CreateWeekScheduleRequest {
  readonly days: CreateDayScheduleRequest[];
}
