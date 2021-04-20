import { registerEnumType } from '@nestjs/graphql';
import { OptionAutoload } from './option-autoload.enum';

registerEnumType(OptionAutoload, {
  name: 'OPTION_AUTOLOAD',
  description: 'option autoload',
});

export { OptionAutoload };
