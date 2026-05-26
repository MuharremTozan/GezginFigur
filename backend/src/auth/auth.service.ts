import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateJwt(user: UserDocument): string {
    const payload = { 
      sub: user._id, 
      username: user.username,
      role: user.role 
    };
    return this.jwtService.sign(payload);
  }
}
