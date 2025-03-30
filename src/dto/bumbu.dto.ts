export interface CreateBumbuDTO {
  nama: string;
  deskripsi: string;
  gambar: string;
  harga: string;
}

export interface UpdateBumbuDTO {
  nama?: string;
  deskripsi?: string;
  gambar?: string;
  harga?: string;
}
