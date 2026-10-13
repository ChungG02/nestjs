import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự',
  })
  @MaxLength(72, {
    message: 'Mật khẩu không được vượt quá 72 ký tự',
  })
  password!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 120, {
    message: 'Tên hiển thị phải có từ 2 đến 120 ký tự',
  })
  displayName!: string;
}
