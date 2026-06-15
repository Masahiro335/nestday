// Shared type definitions for Calendar Sharing App

// Users
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

// Groups
export interface Group {
  id: string;
  name: string;
  invite_token: string;
  owner_id: string;
  created_at: string;
}

export interface GroupWithMembers extends Group {
  members: User[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

// Calendars
export interface Calendar {
  id: string;
  group_id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Events
export interface Event {
  id: string;
  group_id: string;
  calendar_id: string;
  created_by: string;
  title: string;
  memo?: string;
  color?: string;
  start_at: string;
  end_at: string;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types

// Auth
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

// Groups
export interface CreateGroupRequest {
  name: string;
}

// Calendars
export interface CreateCalendarRequest {
  name: string;
  color: string;
}

export interface UpdateCalendarRequest {
  name?: string;
  color?: string;
}

// Events
export interface CreateEventRequest {
  calendar_id: string;
  title: string;
  memo?: string;
  color?: string;
  start_at: string;
  end_at: string;
  is_all_day?: boolean;
}

export interface UpdateEventRequest {
  title?: string;
  memo?: string;
  color?: string;
  start_at?: string;
  end_at?: string;
  is_all_day?: boolean;
}

// UI Constants

export const EVENT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E9', // Sky Blue
  '#F8B88B', // Peach
  '#ABEBC6', // Light Green
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
