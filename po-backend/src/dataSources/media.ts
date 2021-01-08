import { MetaDataSource } from './meta';

// Types
import Media, { PagedMediaQueryArgs, PagedMedia, MediaAddModel, MediaMetaAddModel } from '@/model/media';
import { MediaCreationAttributes } from './entities/medias';
import MediaMeta, { MediaMetaCreationAttributes } from './entities/mediaMeta';

export default class MediaDataSource extends MetaDataSource<MediaMeta, MediaMetaAddModel> {
  get(id: number, fields: string[]): Promise<Media | null> {
    return this.models.Medias.findByPk(id, {
      attributes: this.filterFields(fields, this.models.Medias),
    });
  }

  getPaged({ offset, limit, ...query }: PagedMediaQueryArgs, fields: string[]): Promise<PagedMedia> {
    return this.models.Medias.findAndCountAll({
      attributes: this.filterFields(fields, this.models.Medias),
      where: {
        ...query,
      },
      offset,
      limit,
      order: [['created_at', 'DESC']],
    }).then(({ rows, count: total }) => ({
      rows,
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
  async create(model: MediaAddModel): Promise<Media | null> {
    const isExists = await this.isExists(model.fileName);

    if (!isExists) {
      const { metas, ...rest } = model;
      const creationModel: MediaCreationAttributes = {
        ...rest,
      };

      const media = await this.models.Medias.create(creationModel);

      if (metas && metas.length) {
        const metaCreationModels: MediaMetaCreationAttributes[] = metas.map((meta) => {
          return {
            ...meta,
            mediaId: media.id,
          };
        });
        this.models.MediaMeta.bulkCreate(metaCreationModels);
      }

      return media;
    }
    return null;
  }

  /**
   * 根据 Id 删除
   * @param id Media Id
   */
  delete(id: number): Promise<boolean> {
    return this.models.Medias.destroy({
      where: { id },
    }).then((count) => count > 0);
  }
}
