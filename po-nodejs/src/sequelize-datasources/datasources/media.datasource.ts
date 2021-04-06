import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ValidationError } from '@/common/utils/gql-errors.utils';
import { MetaDataSource } from './meta.datasource';

// Types
import {
  MediaModel,
  MediaMetaModel,
  PagedMediaArgs,
  PagedMediaModel,
  NewMediaInput,
  NewMediaMetaInput,
} from '../interfaces/media.interface';

@Injectable()
export class MediaDataSource extends MetaDataSource<MediaMetaModel, NewMediaMetaInput> {
  constructor(protected readonly moduleRef: ModuleRef) {
    super(moduleRef);
  }

  /**
   * 获取媒体
   * @param id Media Id
   * @param fields 返回的字段
   */
  get(id: number, fields: string[]): Promise<MediaModel | null> {
    // 主键(meta 查询)
    if (!fields.includes('id')) {
      fields.push('id');
    }

    return this.models.Medias.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Medias),
    }).then((media) => media?.toJSON() as MediaModel);
  }

  /**
   * 获取媒体分页
   * @param param 查询条件
   * @param fields 返回的字段
   */
  getPaged({ offset, limit, ...query }: PagedMediaArgs, fields: string[]): Promise<PagedMediaModel> {
    return this.models.Medias.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Medias),
      where: {
        ...query,
      },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows: rows as PagedMediaModel['rows'],
      total,
    }));
  }

  /**
   * 判断文件名是否在在 (通常文件名为 md5 用于判断唯一)
   * @param fileName 文件名
   */
  async isExists(fileName: string): Promise<boolean> {
    return (
      (await this.models.Medias.count({
        where: {
          fileName,
        },
      })) > 0
    );
  }

  /**
   * 添加媒体（如果文件名已经存在，则返回 null）
   * @param model 添加实体模型
   * @param fields 返回的字段
   */
  async create(model: NewMediaInput): Promise<MediaModel> {
    const isExists = await this.isExists(model.fileName);

    if (isExists) {
      throw new ValidationError(`The media filename "${model.fileName}" has existed!`);
    }

    const { metas, ...rest } = model;
    const t = await this.sequelize.transaction();
    try {
      const media = await this.models.Medias.create(rest, { transaction: t });

      if (metas && metas.length) {
        this.models.MediaMeta.bulkCreate(
          metas.map((meta) => {
            return {
              ...meta,
              mediaId: media.id,
            };
          }),
          {
            transaction: t,
          },
        );
      }

      await t.commit();

      return media.toJSON() as MediaModel;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * 根据 Id 删除
   * @param id Media Id
   */
  async delete(id: number): Promise<true> {
    const t = await this.sequelize.transaction();
    try {
      await this.models.MediaMeta.destroy({
        where: {
          mediaId: id,
        },
        transaction: t,
      });

      await this.models.Medias.destroy({
        where: {
          id,
        },
        transaction: t,
      });

      await t.commit();

      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
