/**
 * Term 相关的增、删、改功能
 */
import { Vue, Component } from 'nuxt-property-decorator';
import { gql } from '@/includes/functions';
import { TermTaxonomy } from '@/includes/datas/enums';

// Types
import {
  Term,
  TermCreationModel,
  TermUpdateModel,
  TermRelationship,
  TermRelationshipCreationModel,
} from 'types/datas/term';

@Component
export default class TermMixin extends Vue {
  /**
   * 新建
   * @param model 新建参数值
   * @param taxonomy 类别
   */
  createTerm(model: TermCreationModel, taxonomy: TermTaxonomy) {
    return this.graphqlClient
      .mutate<{ term: Term }, { model: TermCreationModel & { taxonomy: TermTaxonomy } }>({
        mutation: gql`
          mutation createTerm($model: NewTermInput!) {
            term: createTerm(model: $model) {
              id
              taxonomyId
              name
            }
          }
        `,
        variables: {
          model: {
            ...model,
            taxonomy,
          },
        },
      })
      .then(({ data }) => data!.term);
  }

  /**
   * 修改
   * @param id termId
   * @param values 修改参数值
   */
  updateTerm(id: string, model: TermUpdateModel) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string; model: TermUpdateModel }>({
        mutation: gql`
          mutation updateTerm($id: ID!, $model: UpdateTermInput!) {
            result: updateTerm(id: $id, model: $model)
          }
        `,
        variables: {
          id,
          model,
        },
      })
      .then(({ data }) => data?.result);
  }

  /**
   * 删除
   * @param id termId
   */
  deleteTerm(id: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { id: string }>({
        mutation: gql`
          mutation deleteTerm($id: ID!) {
            result: deleteTerm(id: $id)
          }
        `,
        variables: {
          id,
        },
      })
      .then(({ data }) => data?.result);
  }

  /**
   * 批量删除
   * @param ids termId
   */
  blukDeleteTerms(ids: string[]) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { ids: string[] }>({
        mutation: gql`
          mutation blukDeleteTerms($ids: [ID!]!) {
            result: bulkDeleteTerms(ids: $ids)
          }
        `,
        variables: {
          ids,
        },
      })
      .then(({ data }) => data?.result);
  }

  /**
   *  添加关系
   * @param objectId postId
   * @param taxonomyId taxonomyId
   */
  createTermRelationship(objectId: string, taxonomyId: string) {
    return this.graphqlClient
      .mutate<{ relationship: TermRelationship }, { model: TermRelationshipCreationModel }>({
        mutation: gql`
          mutation createTermRelationship($model: NewTermRelationshipInput!) {
            relationship: createTermRelationship(model: $model) {
              objectId
              taxonomyId
            }
          }
        `,
        variables: {
          model: {
            objectId,
            taxonomyId,
          },
        },
      })
      .then(({ data }) => data?.relationship);
  }

  /**
   *  移除关系
   * @param objectId postId
   * @param taxonomyId taxonomyId
   */
  deleteTermRelationship(objectId: string, taxonomyId: string) {
    return this.graphqlClient
      .mutate<{ result: boolean }, { objectId: string; taxonomyId: string }>({
        mutation: gql`
          mutation deleteTermRelationship($objectId: ID!, $taxonomyId: ID!) {
            result: deleteTermRelationship(objectId: $objectId, taxonomyId: $taxonomyId)
          }
        `,
        variables: {
          objectId,
          taxonomyId,
        },
      })
      .then(({ data }) => !!data?.result);
  }
}
