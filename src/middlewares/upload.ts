import multer from "multer";

const storage = multer.memoryStorage(); // simpan sementara di storage
const upload = multer({ storage });

export default upload;
