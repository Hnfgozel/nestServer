import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Firestore } from '@google-cloud/firestore';

interface User {
  username: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  reservationId: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface Reservation {
  flightNumber: string;
  date: admin.firestore.Timestamp;
  customers: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

interface AiData {
  reservationId: string;
  aiComments: string[];
  aiSuggestions: string[];
  summary: string;
  generatedAt: admin.firestore.Timestamp;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: Firestore;

  constructor(private configService: ConfigService) {}

  getFirestore(): Firestore {
    return this.firestore;
  }

  async onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    this.firestore = admin.firestore();
    
    await this.generateMockDataIfNeeded(false);
  }

  private async generateMockDataIfNeeded(forceRegenerate = false) {
    if (forceRegenerate) {
      // Delete all existing data
      const collections = ['users', 'reservations', 'customers', 'aiData'];
      for (const collectionName of collections) {
        const snapshot = await this.firestore.collection(collectionName).get();
        const batch = this.firestore.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      
      // Generate new data
      await this.generateMockData();
      return;
    }

    // Check if data exists
    const usersRef = this.firestore.collection('users');
    const snapshot = await usersRef.limit(1).get();

    if (snapshot.empty) {
      await this.generateMockData();
    }
  }

  private async generateMockData() {
    const batch = this.firestore.batch();
    
    // Generate Users
    const adminUser = this.firestore.collection('users').doc('admin123');
    batch.set(adminUser, {
      username: 'admin',
      password: '123456', 
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const staffUser = this.firestore.collection('users').doc('staff123');
    batch.set(staffUser, {
      username: 'staff',
      password: '123456', 
      role: 'staff',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate Reservations and Customers
    const statuses: ('confirmed' | 'pending' | 'cancelled')[] = ['confirmed', 'pending', 'cancelled'];
    
    for (let i = 0; i < 1000; i++) {
      // Create Reservation
      const reservationRef = this.firestore.collection('reservations').doc();
      const customersCount = Math.floor(Math.random() * 3) + 1; // 1-3 customers
      const customerIds: string[] = [];

      // Create Customers for this reservation
      for (let j = 0; j < customersCount; j++) {
        const customerRef = this.firestore.collection('customers').doc();
        customerIds.push(customerRef.id);

        batch.set(customerRef, {
          name: `Customer ${Math.random().toString(36).substring(7)}`,
          email: `customer${Math.random().toString(36).substring(7)}@example.com`,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          reservationId: reservationRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Set Reservation
      batch.set(reservationRef, {
        flightNumber: `FL${Math.floor(Math.random() * 9999)}`,
        date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        customers: customerIds,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate AI Data
      const aiDataRef = this.firestore.collection('aiData').doc(reservationRef.id);
      batch.set(aiDataRef, {
        reservationId: reservationRef.id,
        aiComments: [
          'Flight is scheduled on time.',
          'Weather conditions are favorable.',
          'Standard baggage allowance applies.',
        ],
        aiSuggestions: [
          'Consider offering seat upgrade options.',
          'Recommend travel insurance.',
          'Suggest early check-in.',
        ],
        summary: `Reservation ${reservationRef.id} is ${statuses[Math.floor(Math.random() * statuses.length)]} for flight ${Math.floor(Math.random() * 9999)}.`,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  async getReservations(page: number, limit: number) {
    const snapshot = await this.firestore
      .collection('reservations')
      .orderBy('date')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const total = (await this.firestore.collection('reservations').count().get()).data().count;

    const reservations = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as Reservation;
        const customers = await Promise.all(
          data.customers.map(async (customerId) => {
            const customerDoc = await this.firestore.collection('customers').doc(customerId).get();
            return { id: customerDoc.id, ...customerDoc.data() };
          })
        );

        return {
          id: doc.id,
          ...data,
          date: data.date.toDate().toISOString(),
          customers,
        };
      })
    );

    return {
      data: reservations,
      total,
      page,
      limit,
    };
  }

  async getReservationsWithCustomers(page: number, limit: number) {
    const result = await this.getReservations(page, limit);
    const reservationsWithAI = await Promise.all(
      result.data.map(async (reservation) => {
        const aiDataDoc = await this.firestore.collection('aiData').doc(reservation.id).get();
        const aiData = aiDataDoc.exists ? aiDataDoc.data() : null;
        
        return {
          ...reservation,
          aiData: aiData ? {
            ...aiData,
            generatedAt: aiData.generatedAt.toDate().toISOString(),
          } : null,
        };
      })
    );

    return {
      ...result,
      data: reservationsWithAI,
    };
  }
} 