import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService, FirebaseAuthGuard],
  exports: [FirebaseService, FirebaseAuthGuard],
})
export class FirebaseModule {}
