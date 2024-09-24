import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: any; // dapat mengganti `any` dengan tipe yang lebih spesifik sesuai dengan struktur data pengguna
}
