export type CalendarMember = {
  _id: string;
  name: string;
  email: string;
  color?: string;
};

export type CalendarChore = {
  _id: string;
  title: string;
  defaultPoints: number;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
};

export type CalendarEntry = {
  _id: string;
  date: string;
  status: string;
  assignedToUserId: CalendarMember;
  choreId: CalendarChore;
};
export type Member = Pick<CalendarMember, "_id" | "name" | "color">;
export type Entry = {
  _id: string;
  status: string;
  date: string;
  assignedToUserId: Member;
  choreId: CalendarChore;
};

export type MonthDay = { date: string; inMonth: boolean };
export type WeekDay = { date: string };

export type HeatDay = {
  date: string;
  inMonth: boolean;
  count: number;
  points: number;
};
