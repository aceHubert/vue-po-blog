export interface Token {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface RefreshToken extends Omit<Token, 'refreshToken'> {
  refreshToken?: string;
}
