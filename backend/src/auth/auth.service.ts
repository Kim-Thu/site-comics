import { MailerService } from '@nestjs-modules/mailer';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOne(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    // For development, we set new users as ADMIN so they can log in to CMS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...user } = await this.usersService.create({
      ...registerDto,
      role: 'ADMIN' as any
    });
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      // Security: Do not reveal if email exists
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    // Generate a simple token (in real app use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.update(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // Updated link to point to CMS dev port 3005 and reset-password route
    const resetLink = `http://localhost:3005/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Password - Comic App',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #6366f1;">Đặt lại mật khẩu</h1>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản CMS của mình. Vui lòng click vào nút bên dưới để cập nhật mật khẩu mới:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Đổi mật khẩu ngay</a>
            <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });
      console.log(`[Email Sent] Reset link sent to ${email}`);
    } catch (error) {
      console.error('[Email Error]', error);
    }

    return { message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết khôi phục.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    
    // Find user by reset token
    const user = await (this.usersService as any).prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date()
            }
        }
    });

    if (!user) {
        throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    // Update password and clear token
    await this.usersService.update(user.id, {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
    });

    return { message: 'Mật khẩu đã được cập nhật thành công.' };
  }
}
