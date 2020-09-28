import path from 'path'
import { JwtConfig } from "../app/Interfaces/JwtConfig"
import Env from '@ioc:Adonis/Core/Env'

const jwtConfig: JwtConfig = {
  /*
  |--------------------------------------------------------------------------
  | Jwt hash algorithm
  |--------------------------------------------------------------------------
  |
  | Algoritm for jwt. Support list 
  | HS256, HS384, HS512
  | RS256, RS384, RS512
  | PS256, PS384, PS512
  | ES256, ES384, ES512
  |
  */
  tokenAlgorithm: Env.get('JWT_HASH', 'HS256') as string,

  /*
  |--------------------------------------------------------------------------
  | Secret key
  |--------------------------------------------------------------------------
  |
  | If algorithm HSxxx, jwt need a secret
  |
  */
  secretKey:  Env.get('JWT_SECRET', Env.get('APP_KEY', '') as string) as string,

  /*
  |--------------------------------------------------------------------------
  | Private key certificate
  |--------------------------------------------------------------------------
  |
  | If algorithm RSxxx, jwt need location certificate
  |
  */
  privateKey: path.join(process.cwd(), Env.get('JWT_CERT_PRIVATE', '') as string),

  /*
  |--------------------------------------------------------------------------
  | Private Key Certificate
  |--------------------------------------------------------------------------
  |
  | If algorithm RSxxx, jwt need location certificate
  |
  */
  publicKey:  path.join(process.cwd(), Env.get('JWT_CERT_PUBLIC', '') as string),

  /*
  |--------------------------------------------------------------------------
  | Jwt token valid
  |--------------------------------------------------------------------------
  |
  | How long token valid
  |
  */
  tokenValid: Env.get('JWT_EXPIRED', '2h') as string
}

export default jwtConfig