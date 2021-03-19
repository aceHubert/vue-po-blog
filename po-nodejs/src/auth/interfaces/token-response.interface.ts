export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface RefreshTokenResponse extends Omit<TokenResponse, 'refreshToken'> {
  refreshToken?: string;
}
