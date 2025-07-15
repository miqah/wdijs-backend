import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { signIn } from './methods/signIn';
import signUp from './methods/signUp';

@Injectable()
export class AuthService {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly firebaseService: FirebaseService,
  ) {}

  signIn = signIn;
  signUp = signUp;
}
