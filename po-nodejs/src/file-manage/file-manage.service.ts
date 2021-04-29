import { promisify } from 'util';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';
import Jimp from 'jimp';
import { Inject, Injectable } from '@nestjs/common';
import { normalizeRoutePath, addStartingSlash, stripEndingSlash } from '@/common/utils/normalize-route-path.util';
import { OptionKeys } from '@/common/utils/option-keys.util';
import { MediaMetaKeys } from '@/common/utils/media-meta-keys.util';
import { MediaDataSource } from '@/sequelize-datasources/datasources';
import { FileManageModuleOptions } from './interfaces';
import { FILE_MANAGE_MODULE_OPTIONS } from './constants';

// Types
import { NewMetaInput, MediaMetaModel } from '@/sequelize-datasources/interfaces';
import { FileUploadOptions } from './interfaces/file-upload-options.interface';
import { ImageMetadata } from './interfaces/image-metadata.interface';

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

@Injectable()
export class FileManageService {
  // private readonly logger = new Logger('FileManageService');

  constructor(
    @Inject(FILE_MANAGE_MODULE_OPTIONS) private readonly options: Required<FileManageModuleOptions>,
    private readonly mediaDataSource: MediaDataSource,
  ) {}

  /**
   * 根据options 配置获取 dest 目录
   * 如果不存在会自动创建
   */
  private async getDest(): Promise<string> {
    const year = moment().get('year');
    const month = moment().get('month');
    const dest = path.join(
      this.options.dest,
      ...(this.options.groupBy === 'year' ? [String(year)] : [String(year), String(month + 1).padStart(2, '0')]),
    );
    try {
      await stat(dest);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // 目录不在在，创建目录
        await mkdir(dest, { recursive: true });
      } else {
        throw err;
      }
    }
    return dest;
  }

  /**
   * 文件是否在在
   */
  private async isExists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
  }

  /**
   * 获取文件md5
   */
  private async getFileMd5(file: string | Buffer): Promise<string> {
    const hash = crypto.createHash('md5');
    let fileBuffer = file as Buffer;
    if (typeof file === 'string') {
      fileBuffer = await readFile(file);
    }
    return hash.update(fileBuffer.toString('binary'), 'binary').digest('hex');
  }

  /**
   * 获取带后缀的图片路径
   * @param imagePath 源图片路径
   * @param suffix 后缀
   */
  private getImageDestWithSuffix(imagePath: string, suffix: string) {
    const dir = path.dirname(imagePath);
    const extension = path.extname(imagePath);
    const filename = path.basename(imagePath, extension);
    return path.join(dir, `${filename}-${suffix}${extension}`);
  }

  /**
   * 是否支持缩放（图片）
   */
  isScaleable(mimeType: string) {
    return ['image/jpeg', 'image/png'].includes(mimeType);
  }

  /**
   * 添加 siteUrl 和 staticPrefix 前缀
   */
  async getNormalizedPath(path: string) {
    const siteUrl = await this.mediaDataSource.getOption(OptionKeys.SiteUrl);
    return (
      (siteUrl ? stripEndingSlash(siteUrl) : '') +
      stripEndingSlash(this.options.staticPrefix) +
      normalizeRoutePath(path)
    );
  }

  /**
   * 上传文件
   * 返回原始文件参数在 original 上，如果是图片，还会生成缩略图和不同尺寸的图片，key 分别是：thumbnail、scaled、{width}x{height}
   * @param options 文件参数
   * @param requestUser 请求用户
   */
  async uploadFile(
    options: FileUploadOptions,
    requestUser?: JwtPayloadWithLang,
  ): Promise<Dictionary<{ fileName: string; path: string }>> {
    const md5 = await this.getFileMd5(options.file);
    let media = await this.mediaDataSource.getByName(md5, ['originalFileName', 'extension', 'mimeType', 'path']);
    let mediaMetas: MediaMetaModel[] | null = null;
    if (!media) {
      const extension = path.extname(options.originalName);
      const originalFileName = path.basename(options.originalName, extension);
      const dest = await this.getDest();
      const filePath = path.join(dest, `${md5}${extension}`);
      const newMetaInputs: NewMetaInput[] = [];
      // 文件不在在
      if (!(await this.isExists(filePath))) {
        if (typeof options.file === 'string') {
          const content = await readFile(options.file);
          await writeFile(filePath, content, 'utf8');
        } else {
          await writeFile(filePath, options.file, 'utf8');
        }

        // this.mediaDataSource.createMeta();

        if (this.isScaleable(options.mimeType)) {
          const imageMetadatas: ImageMetadata[] = [];
          const thumbnail = await this.scaleToThumbnail(filePath, 50);
          imageMetadatas.push({ ...thumbnail, name: 'thumbnail' });
          const scaled = await this.scaleImage(filePath, 2560, 1440, 'scaled', 90);
          scaled && imageMetadatas.push({ ...scaled, name: 'scaled' });

          const mediumWidth = parseInt((await this.mediaDataSource.getOption(OptionKeys.MediumSizeWidth))!);
          const mediumHeight = parseInt((await this.mediaDataSource.getOption(OptionKeys.MediumSizeHeight))!);
          const largeWidth = parseInt((await this.mediaDataSource.getOption(OptionKeys.LargeSizeWidth))!);
          const largeHeight = parseInt((await this.mediaDataSource.getOption(OptionKeys.LargeSizeHeight))!);
          const mediumLargeWidth = parseInt((await this.mediaDataSource.getOption(OptionKeys.MediumLargeSizeWidth))!);
          const mediumLargeHeight = parseInt((await this.mediaDataSource.getOption(OptionKeys.MediumLargeSizeHeight))!);
          const resizeArr = [
            { name: 'large', width: largeWidth, height: largeHeight, quality: 80 },
            { name: 'medium-large', width: mediumLargeWidth, height: mediumLargeHeight, quality: 70 },
            { name: 'medium', width: mediumWidth, height: mediumHeight, quality: 50 },
          ];
          const scales = await this.scaleImage(filePath, resizeArr);
          scales.length && imageMetadatas.push(...scales);
          newMetaInputs.push({ metaKey: MediaMetaKeys.Matedata, metaValue: JSON.stringify({ image: imageMetadatas }) });
        }
      }

      media = await this.mediaDataSource.create(
        {
          fileName: md5,
          originalFileName: originalFileName,
          extension,
          mimeType: options.mimeType,
          path: addStartingSlash(path.relative(this.options.dest, filePath)),
        },
        requestUser,
      );

      if (newMetaInputs.length) {
        mediaMetas = await this.mediaDataSource.bulkCreateMeta(media.id, newMetaInputs);
      }
    } else if (this.isScaleable(media.mimeType)) {
      mediaMetas = await this.mediaDataSource.getMetas(media.id, [MediaMetaKeys.Matedata], ['metaKey', 'metaValue']);
    }
    const fileName = `${media.originalFileName}${media.extension}`;
    return {
      original: {
        fileName,
        path: media.path,
      },
      ...(mediaMetas
        ? mediaMetas.reduce((prev, meta) => {
            if (meta.metaKey === MediaMetaKeys.Matedata) {
              const metadatas = JSON.parse(meta.metaValue!) as Dictionary<any>;
              metadatas.image &&
                (metadatas.image as ImageMetadata[]).forEach((item) => {
                  prev[item.name] = {
                    fileName,
                    path: item.path,
                  };
                });
            }

            return prev;
          }, {} as Dictionary<any>)
        : null),
    };
  }

  /**
   * 生成略缩图
   * @param imagePath 源图片路径
   */
  async scaleToThumbnail(imagePath: string, quality: number = 100): Promise<Omit<ImageMetadata, 'name'>> {
    const width = parseInt((await this.mediaDataSource.getOption(OptionKeys.ThumbnailSizeWidth)) || '150');
    const height = parseInt((await this.mediaDataSource.getOption(OptionKeys.ThumbnailSizeHeight)) || '150');
    const crop = await this.mediaDataSource.getOption<'0' | '1'>(OptionKeys.ThumbnailCrop);
    const image = await Jimp.read(imagePath);
    if (crop) {
      image.cover(width, height);
    } else {
      image.scaleToFit(width, height);
    }
    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();
    const newPath = this.getImageDestWithSuffix(imagePath, `${imageWidth}x${imageHeight}`);
    await image.quality(quality || 100).write(newPath);
    return {
      width: imageWidth,
      height: imageHeight,
      path: addStartingSlash(path.relative(this.options.dest, newPath)),
    };
  }

  /**
   * 缩放图片
   * @param imagePath 源图片路径
   * @param width 宽度
   * @param height 高度
   * @param suffix 图片名称后缀，如果为空则是以 {width}x{height} 作为后缀
   */
  async scaleImage(
    imagePath: string,
    args: Array<{ name: number | string; width: number; height: number; suffix?: string; quality?: number }>,
  ): Promise<Array<ImageMetadata>>;
  async scaleImage(
    imagePath: string,
    width: number,
    height: number,
    suffix?: string,
    quality?: number,
  ): Promise<Omit<ImageMetadata, 'name'> | undefined>;
  async scaleImage(
    imagePath: string,
    widthOrArrayArgs: number | Array<{ name: number | string; width: number; height: number; suffix?: string }>,
    height?: number,
    suffix?: string,
  ): Promise<Array<ImageMetadata> | Omit<ImageMetadata, 'name'> | undefined> {
    const destDir = this.options.dest;
    const getImageDest = this.getImageDestWithSuffix;
    const image = await Jimp.create(imagePath);
    if (Array.isArray(widthOrArrayArgs)) {
      const args = widthOrArrayArgs;
      return args
        .map((item) => ({ ...resize(image.clone(), item.width, item.height, item.suffix), name: item.name }))
        .filter(Boolean) as ImageMetadata[];
    } else {
      const width = widthOrArrayArgs;
      return resize(image, width, height!, suffix);
    }

    function resize(image: Jimp, width: number, height: number, suffix?: string, quality: number = 100) {
      if (image.getWidth() > width || image.getHeight() > height) {
        if (width === 0 || height === 0) {
          image.resize(width || Jimp.AUTO, height || Jimp.AUTO);
        } else {
          image.scaleToFit(width, height);
        }
        const imageWidth = image.getWidth();
        const imageHeight = image.getHeight();
        const newPath = getImageDest(imagePath, suffix || `${imageWidth}x${imageHeight}`);
        image.quality(quality).write(newPath);
        return {
          width: imageWidth,
          height: imageHeight,
          path: addStartingSlash(path.relative(destDir, newPath)),
        };
      }
      return;
    }
  }
}
