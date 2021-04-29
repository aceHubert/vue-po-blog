import { Controller, Post, Scope, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { I18n, I18nContext } from 'nestjs-i18n';
import { BaseController } from '@/common/controllers/base.controller';
import { User } from '@/common/decorators/user.decorator';
import { FileManageService } from './file-manage.service';

@Controller({ path: 'api/file', scope: Scope.REQUEST })
export class FileManageController extends BaseController {
  constructor(private readonly fileService: FileManageService) {
    super();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @I18n() i18n: I18nContext,
    @User() requestUser?: JwtPayloadWithLang,
  ) {
    const result = await this.fileService.uploadFile(
      {
        file: file.path || file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
      requestUser,
    );
    const resp = await Object.keys(result).reduce(async (prev, key) => {
      const _prev = await prev;
      _prev[key] = {
        filename: result[key].fileName,
        url: await this.fileService.getNormalizedPath(result[key].path),
      };
      return _prev;
    }, Promise.resolve({}) as Promise<Dictionary<any>>);
    return this.success(resp);
  }

  @Post('upload-multi')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @I18n() i18n: I18nContext,
    @User() requestUser?: JwtPayloadWithLang,
  ) {
    const result = await Promise.all(
      files.map((file) =>
        this.fileService.uploadFile(
          {
            file: file.path || file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
          },
          requestUser,
        ),
      ),
    );
    const resp = await Promise.all(
      result.map((item) =>
        Object.keys(item).reduce(async (prev, key) => {
          const _prev = await prev;
          _prev[key] = {
            filename: item[key].fileName,
            url: await this.fileService.getNormalizedPath(item[key].path),
          };
          return _prev;
        }, Promise.resolve({}) as Promise<Dictionary<any>>),
      ),
    );
    return this.success({ files: resp });
  }
}
