export interface CreateBumbuDTO {
  nama: string;
  deskripsi: string;
  gambar: string;
  harga: number;
}

export interface UpdateBumbuDTO {
  id?: string;
  nama?: string;
  deskripsi?: string;
  gambar?: string;
  harga?: number;
}
