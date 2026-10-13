import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  @MaxLength(72)
  password!: string;
}
