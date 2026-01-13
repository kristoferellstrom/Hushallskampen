export type CalendarMember = { _id: string; name: string; email: string; color?: string };

export type CalendarChore = { _id: string; title: string; defaultPoints: number };

export type CalendarEntry = {
  _id: string;
  date: string;
  status: string;
  assignedToUserId: CalendarMember;
  choreId: CalendarChore;
};
