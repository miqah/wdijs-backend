import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { login } from './methods/login';
import { signup } from './methods/signup';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly firebaseService: FirebaseService,
  ) {}

  login = login;
  signup = signup;
}
