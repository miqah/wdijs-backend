// auth/firebase-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from 'app/firebase/firebase.service';
import { PrismaService } from 'app/prisma/prisma.service';
import { IS_PUBLIC_KEY } from 'decorators/public.decorator';
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private prismaService: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Firebase ID token is missing');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const decodedToken = await this.firebaseService.verifyToken(idToken);

      const user = await this.prismaService.user.findFirstOrThrow({
        where: {
          firebaseUid: decodedToken.uid,
        },
      });

      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid Firebase token: ' + error.message,
      );
    }
  }
}
