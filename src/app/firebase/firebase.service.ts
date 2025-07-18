import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = this.configService.get<
        string | admin.ServiceAccount
      >('FIREBASE_SERVICE_ACCOUNT');
      
      if (!serviceAccount) {
        throw new Error('Cannot load Firebase service account.');
      }
      
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin initialized successfully');
      } catch (error) {
        this.logger.error('Firebase initialization error:', error);
        throw error;
      }
    } else {
      this.logger.log('Firebase Admin was already initialized');
    }
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      this.logger.error(`Token verification error: ${error.message}`);
      throw new UnauthorizedException('Invalid token: ' + error.message);
    }
  }

  // Get user by UID
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().getUser(uid);
    } catch (error) {
      this.logger.error(`User lookup error: ${error.message}`);
      throw new Error('User not found: ' + error.message);
    }
  }
}