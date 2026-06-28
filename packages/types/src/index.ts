// Shared type definitions for Calendar Sharing App

// Users
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Groups
export interface Group {
  id: string;
  name: string;
  inviteToken: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupWithMembers extends Group {
  members: User[];
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
}

export interface GroupPreview {
  id: string;
  name: string;
  memberCount: number;
}

// Calendars
export interface Calendar {
  id: string;
  groupId: string;
  name: string;
  color: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Events
export interface Event {
  id: string;
  groupId: string;
  calendarId: string;
  createdBy: string;
  title: string;
  memo?: string;
  location?: string;
  color?: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

// ShiftPatterns
export interface ShiftPattern {
  id: string;
  userId: string;
  name: string;
  color: string;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  isDayOff: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Shifts
export interface Shift {
  id: string;
  userId: string;
  groupId: string;
  shiftPatternId: string;
  shiftPattern?: ShiftPattern;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Request/Response
export interface AuthRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: User;
  token: string;
}

// Calendar Requests
export interface CreateCalendarRequest {
  groupId?: string;
  name: string;
  color: string;
}

export interface UpdateCalendarRequest {
  name?: string;
  color?: string;
}

// Event Requests
export interface CreateEventRequest {
  calendarId: string;
  title: string;
  memo?: string;
  location?: string;
  color?: string;
  startAt: string;
  endAt: string;
  isAllDay?: boolean;
  isSecret?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  memo?: string;
  location?: string;
  color?: string;
  startAt?: string;
  endAt?: string;
  isAllDay?: boolean;
  isSecret?: boolean;
}

// ShiftPattern Requests
export interface CreateShiftPatternRequest {
  name: string;
  color: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  isDayOff?: boolean;
  sortOrder?: number;
}

export interface UpdateShiftPatternRequest {
  name?: string;
  color?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  isDayOff?: boolean;
  sortOrder?: number;
}

// Shift Requests
export interface AssignShiftRequest {
  shiftPatternIds: string[];
}

// Group Requests
export interface CreateGroupRequest {
  name: string;
}

// UI Constants
export const EVENT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8B88B',
  '#ABEBC6',
] as const;

export type EventColor = (typeof EVENT_COLORS)[number];

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Error Response
export interface ErrorResponse {
  message: string;
  code: string;
  timestamp: string;
}
