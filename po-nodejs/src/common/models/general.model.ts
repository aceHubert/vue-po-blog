import { Type } from '@nestjs/common';
import { ArgsType, ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

@ArgsType()
export class PagedArgs {
  @Field((type) => Int, { nullable: true, defaultValue: 0, description: '分页偏移量' })
  offset!: number;

  @Field((type) => Int, { nullable: true, defaultValue: 10, description: '页大小' })
  limit!: number;

  // get startIndex(): number {
  //   return this.offset;
  // }
  // get endIndex(): number {
  //   return this.offset + this.limit;
  // }
}

// export function PagedResponse<IItem>(TItemClass: ClassType<IItem>) {
//   @ObjectType(`Paged${TItemClass.name}`)
//   class PagedClass {
//     @Field((type) => [TItemClass])
//     rows!: IItem[];

//     @Field((type) => Int)
//     total!: number;
//   }
//   return PagedClass;
// }

/**
 * https://typegraphql.com/docs/generic-types.html
 */
export function PagedResponse<TItemsFieldValue>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  itemsFieldValue: Type<TItemsFieldValue> | GraphQLScalarType | String | Number | Boolean,
) {
  @ObjectType({ isAbstract: true })
  abstract class PagedClass {
    @Field((type) => [itemsFieldValue])
    rows!: TItemsFieldValue[];

    @Field((type) => Int)
    total!: number;
  }
  return PagedClass;
}

@ObjectType({ isAbstract: true, description: '分组数量模型' })
export abstract class Count {
  @Field((type) => Int, { description: '分组数量' })
  count!: number;
}
