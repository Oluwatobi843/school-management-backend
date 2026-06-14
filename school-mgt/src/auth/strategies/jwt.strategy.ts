import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";




@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(private authService : AuthService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'jwt_secret',
    });
  }


  async validate(payload: any){
    try {
      const user = await this.authService.getUserById(payload.id)

      return{
        id: user.id,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName

      }
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}