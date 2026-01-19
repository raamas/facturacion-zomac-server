import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import SupabaseClient from '../supabase-client';
import { ConfigService } from '@nestjs/config';
@Controller('users')
export class UsersController {
  supabaseClient: SupabaseClient;
  configService: ConfigService;
  constructor(configService: ConfigService) {
    this.supabaseClient = new SupabaseClient(configService);
    this.configService = configService;
  }
  @Get()
  async getAllUsers() {
    const {
      data: { users },
      error,
    } = await this.supabaseClient.supabase.auth.admin.listUsers();
    if (error) return { error };
    return users;
  }

  //For One
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const { data, error } =
      await this.supabaseClient.supabase.auth.admin.getUserById(id);
    if (error) return { error };
    return data;
  }
  @Post()
  async createUser(
    @Body()
    body: {
      admin_id: string;
      email: string;
      password: string;
      role: string;
      full_name: string;
    },
  ) {
    if (body.admin_id !== this.configService.get<string>('ADMIN_ID')) {
      return { error: 'Unauthorized' };
    }
    const {
      data: { user },
      error,
    } = await this.supabaseClient.supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: {
        full_name: body.full_name,
        role: body.role,
      },
      email_confirm: true,
    });
    if (error) return { error };
    return user;
  }

  @Put(':id')
  async updateUser(
    @Body()
    body: {
      admin_id: string;
      email: string;
      password: string;
      role: string;
      full_name: string;
      bodega_id: string;
    },
    @Param('id') id: string,
  ) {
    if (body.admin_id !== this.configService.get<string>('ADMIN_ID')) {
      return { error: 'Unauthorized' };
    }
    const { data, error } =
      await this.supabaseClient.supabase.auth.admin.updateUserById(id, {
        email: body.email,
        password: body.password,
        user_metadata: {
          full_name: body.full_name,
          role: body.role,
        },
        email_confirm: true,
      });
    if (error) return { error };

    const { data: _, error: ErrorUpdateBodega } =
      await this.supabaseClient.supabase
        .from('Bodegas')
        .update({
          user_id: id,
        })
        .eq('id', body.bodega_id);

    if (ErrorUpdateBodega) return { error: ErrorUpdateBodega };

    return data;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const { data, error } =
      await this.supabaseClient.supabase.auth.admin.deleteUser(id);
    if (error) return { error };
    return data;
  }
}
