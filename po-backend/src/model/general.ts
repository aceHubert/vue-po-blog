import { ClassType, ArgsType, ObjectType, Field, Int } from 'type-graphql';
import { GraphQLScalarType } from 'graphql';

@ArgsType()
export class PagedQueryArgs {
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
  itemsFieldValue: ClassType<TItemsFieldValue> | GraphQLScalarType | String | Number | Boolean,
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
