import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  constructor(private configService: ConfigService) {
    const serviceAccount = this.configService.get<
      string | admin.ServiceAccount
    >('FIREBASE_SERVICE_ACCOUNT');

    if (!serviceAccount) {
      throw new Error('Cannot load Firebase service account.');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Verify Firebase ID Token
  async verifyIdToken(idToken: string) {
    try {
      // Verify the token using Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken; // Return decoded token to access UID, email, etc.
    } catch (error) {
      this.logger.log('Failed to verify ID token ', error);
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }

  async getUserData(uid: string) {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.log('Failed to get user data ', error);
      throw new UnauthorizedException('User not found');
    }
  }
}
