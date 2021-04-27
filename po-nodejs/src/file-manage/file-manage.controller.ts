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
    const content = await this.fileService.uploadFile(
      {
        file: file.path || file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
      requestUser,
    );
    return this.success(content);
  }

  @Post('upload-multi')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @I18n() i18n: I18nContext,
    @User() requestUser?: JwtPayloadWithLang,
  ) {
    const content = await Promise.all(
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
    return this.success({ files: content });
  }
}
