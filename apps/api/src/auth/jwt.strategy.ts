import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { createPublicKey } from 'crypto';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email?: string;
}

interface Jwk {
  kid: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = config.getOrThrow<string>('SUPABASE_URL');
    // Cache PEM keys by kid to avoid fetching JWKS on every request
    const cachedKeys: Record<string, string> = {};

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'RS256', 'HS256'],
      secretOrKeyProvider: async (
        _req: unknown,
        rawJwt: string,
        done: (err: Error | null, key?: string) => void,
      ) => {
        try {
          const [headerB64] = rawJwt.split('.');
          const header = JSON.parse(
            Buffer.from(headerB64, 'base64url').toString(),
          ) as { kid?: string; alg?: string };

          // HS256: fall back to symmetric secret
          if (header.alg === 'HS256') {
            done(null, config.getOrThrow<string>('SUPABASE_JWT_SECRET'));
            return;
          }

          const kid = header.kid ?? '';
          if (!cachedKeys[kid]) {
            const res = await fetch(
              `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
            );
            const jwks = (await res.json()) as { keys: Jwk[] };
            for (const jwk of jwks.keys) {
              const cryptoKey = createPublicKey({ key: jwk, format: 'jwk' });
              cachedKeys[jwk.kid] = cryptoKey
                .export({ type: 'spki', format: 'pem' })
                .toString();
            }
          }

          if (!cachedKeys[kid]) {
            done(new Error(`Unknown kid: ${kid}`));
            return;
          }
          done(null, cachedKeys[kid]);
        } catch (err) {
          done(err as Error);
        }
      },
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
