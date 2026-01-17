import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import SupabaseClient from 'src/supabase-client';
import { ConfigService } from '@nestjs/config';
@Controller('users')
export class UsersController {
  supabaseClient: SupabaseClient;
  constructor(configService: ConfigService) {
    this.supabaseClient = new SupabaseClient(configService);
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
  @Post()
  async createUser(
    @Body()
    body: {
      email: string;
      password: string;
      role: string;
      full_name: string;
    },
  ) {
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

  //For One
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const { data, error } =
      await this.supabaseClient.supabase.auth.admin.getUserById(id);
    if (error) return { error };
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
