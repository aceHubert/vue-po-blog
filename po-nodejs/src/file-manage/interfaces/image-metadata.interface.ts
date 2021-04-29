export interface ImageMetadata {
  name: string;
  width: number;
  height: number;
  /**
   * 相对于上传目录的路径
   */
  path: string;
}
