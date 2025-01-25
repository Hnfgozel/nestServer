import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ReservationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getReservations(page: number, limit: number) {
    return this.firebaseService.getReservations(page, limit);
  }

  async getReservationsWithCustomers(page: number, limit: number) {
    return this.firebaseService.getReservationsWithCustomers(page, limit);
  }
} 