import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
      usernameField: 'email',
    });
  }

  async validate(payload: any) {
    //return akan masuk ke request.user kemudian log ke controller
    return { user: payload.sub, email: payload.email };
  }
}
