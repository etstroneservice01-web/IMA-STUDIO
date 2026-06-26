export type Role = 'user' | 'admin' | 'observer';

export interface User {
  uid: string;
  username?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: Role;
  createdAt: number;
}

export type ReservationStatus = 'pending' | 'accepted' | 'refused';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // in hours or minutes
  purpose: 'Podcast' | 'Enregistrement audio' | 'Vidéo' | 'Shooting photo' | 'Réunion' | 'Formation' | 'Autre';
  description: string;
  status: ReservationStatus;
  rejectionNote?: string;
  checkedIn?: boolean;
  checkInTime?: number;
  checkedOut?: boolean;
  checkOutTime?: number;
  review?: string;
  reviewDate?: number;
  createdAt: number;
}

export interface BlockedSlot {
  id: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  createdAt: number;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  program: string;
  duration: string;
  date: string;
  time: string;
  intervenant?: string;
  recommendations?: string;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
  createdAt: number;
}

export interface Inscription {
  id: string;
  formationId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  createdAt: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  status: 'new' | 'read' | 'replied' | 'treated';
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}
