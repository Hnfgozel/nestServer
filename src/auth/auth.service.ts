import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';

interface User {
  username: string;
  role: 'admin' | 'staff';
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const usersRef = this.firebaseService.getFirestore().collection('users');
    const snapshot = await usersRef
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Todo: hash the password and compare hashes
    if (userData.password !== password) {
      return null;
    }

    return {
      username: userData.username,
      role: userData.role,
    };
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        userId: user.username,
        username: user.username,
        role: user.role,
      },
    };
  }
} 