export interface CreatePotongDTO {
  nama: string;
  gambar: string;
  berat: string;
}

export interface UpdatePotongDTO {
  id?: string;
  nama?: string;
  berat?: string;
  gambar?: string;
}
