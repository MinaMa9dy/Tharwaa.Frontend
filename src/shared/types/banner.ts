export interface BannerDto {
  id: number;
  title: string;
  imageUrl: string;
}

export interface CreateBannerDto {
  title: string;
  file: File;
}
