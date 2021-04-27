import { promisify } from 'util';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';
import { Inject, Injectable } from '@nestjs/common';
import { normalizeRoutePath, addStartingSlash, stripEndingSlash } from '@/common/utils/normalize-route-path.util';
import { OptionKeys } from '@/common/utils/option-keys.util';
import { MediaDataSource } from '@/sequelize-datasources/datasources';
import { FileManageModuleOptions } from './interfaces';
import { FILE_MANAGE_MODULE_OPTIONS } from './constants';

// Types
import { FileUploadOptions } from './interfaces/file-upload-options.interface';

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
      ...(this.options.groupBy === 'year' ? [String(year)] : [String(year), String(month).padStart(2, '0')]),
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
   * 添加 siteUrl 前缀
   */
  private async getNormalizedPath(path: string) {
    const siteUrl = await this.mediaDataSource.getOption(OptionKeys.SiteUrl);
    return (
      (siteUrl ? stripEndingSlash(siteUrl) : '') +
      stripEndingSlash(this.options.staticPrefix) +
      normalizeRoutePath(path)
    );
  }

  /**
   * 上传文件
   * @param options 文件参数
   * @param requestUser 请求用户
   */
  async uploadFile(
    options: FileUploadOptions,
    requestUser?: JwtPayloadWithLang,
  ): Promise<{ mediaId: number; fileName: string; url: string }> {
    const md5 = await this.getFileMd5(options.file);
    let media = await this.mediaDataSource.getByName(md5, ['originalFileName', 'extension', 'path']);
    if (!media) {
      const extension = path.extname(options.originalName);
      const originalFileName = path.basename(options.originalName, extension);
      const dest = await this.getDest();
      const filePath = path.join(dest, `${md5}${extension}`);

      // 文件不在在
      if (!(await this.isExists(filePath))) {
        if (typeof options.file === 'string') {
          const content = await readFile(options.file);
          await writeFile(filePath, content, 'utf8');
        } else {
          await writeFile(filePath, options.file, 'utf8');
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
    }
    return {
      mediaId: media.id,
      fileName: `${media.originalFileName}${media.extension}`,
      url: await this.getNormalizedPath(media.path),
    };
  }
}
