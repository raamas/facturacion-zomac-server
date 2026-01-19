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
      role: string;
      full_name: string;
      bodega_id: string;
    },
    @Param('id') id: string,
  ) {
    console.log(body);
    if (body.admin_id !== this.configService.get<string>('ADMIN_ID')) {
      return { error: 'Unauthorized' };
    }
    const { data: user, error } =
      await this.supabaseClient.supabase.auth.admin.updateUserById(id, {
        email: body.email,
        user_metadata: {
          full_name: body.full_name,
          role: body.role,
        },
        email_confirm: true,
      });
    if (error) return { error };

    const { data: oldBodega, error: errorOldBodega } =
      await this.supabaseClient.supabase
        .from('Bodegas')
        .update({
          usuario: null,
        })
        .eq('usuario', id);
    if (errorOldBodega) {
      console.log('errorOldBodega');
      console.log(errorOldBodega);
      return { error: errorOldBodega };
    }

    const { data: newBodega, error: ErrorUpdateBodega } =
      await this.supabaseClient.supabase
        .from('Bodegas')
        .update({
          usuario: id,
        })
        .eq('id', body.bodega_id);

    if (ErrorUpdateBodega) {
      console.log('ErrorUpdateBodega');
      console.log(ErrorUpdateBodega);
      return { error: ErrorUpdateBodega };
    }

    return user;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const { data, error } =
      await this.supabaseClient.supabase.auth.admin.deleteUser(id);
    if (error) return { error };
    return data;
  }
}
