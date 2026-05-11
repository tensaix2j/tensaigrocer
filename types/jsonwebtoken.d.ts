declare module "jsonwebtoken" {
  export type Secret = string;
  export type SignOptions = {
    expiresIn?: string | number;
  };
  export type JwtPayload = Record<string, unknown>;

  const jwt: {
    sign(payload: string | object | Buffer, secretOrPrivateKey: Secret, options?: SignOptions): string;
    verify(token: string, secretOrPublicKey: Secret): string | JwtPayload;
  };

  export default jwt;
}

