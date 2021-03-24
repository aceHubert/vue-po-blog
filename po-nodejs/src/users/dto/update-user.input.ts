import { InputType, PickType } from '@nestjs/graphql';
import { NewUserInput } from './new-user.input';

@InputType({ description: '用户修改模型' })
export class UpdateUserInput extends PickType(NewUserInput, ['niceName', 'displayName', 'mobile', 'email'] as const) {}
