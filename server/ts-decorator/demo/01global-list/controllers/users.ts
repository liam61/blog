import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Parse,
  Headers,
} from '../decorators';

@Controller('/users')
export default class Users {
  @Get('/')
  getAllUsers(
    @Headers('authorization') auth: string,
    @Query('id') userId: string,
  ) {
    if (auth !== 't:111111') return { code: 401, message: 'forbidden' };
    return {
      code: 200,
      message: 'success',
      data: {
        requester: userId,
        users: [
          { name: 'lawler', gender: 'male' },
          { name: 'natalie', gender: 'female' },
        ],
      },
    };
  }

  @Post('/')
  createUser(
    @Headers('authorization') auth: string,
    @Body('name') name: string,
    @Body('password') psd: string,
    @Parse('number') @Body('gender') gender: number, // 0 | 1
  ) {
    if (auth !== 't:111111') return { code: 401, message: 'forbidden' };
    // handle psd
    return { code: 200, message: 'success', data: { name, gender } };
  }
}
