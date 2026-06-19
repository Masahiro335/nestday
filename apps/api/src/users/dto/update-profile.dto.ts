import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '表示名は50文字以内で入力してください' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'メールアドレスの形式が正しくありません' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'パスワードは8文字以上で入力してください' })
  @MaxLength(100, { message: 'パスワードは100文字以内で入力してください' })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'メモは200文字以内で入力してください' })
  memo?: string;
}
