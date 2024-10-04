import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import { PDFDocument, rgb } from 'pdf-lib';
import B2 from 'backblaze-b2';

@Injectable()
export class UploadFileService {
  private b2: B2;

  constructor() {
    this.b2 = new B2({
      applicationKeyId: '458577d604a2',
      applicationKey: '0059fd9b0b0f50ce1184f61f5f9fb978f3b81803ec',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const filePath = `./uploads/${file.filename}`;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const extractedText = pdfData.text;

    const values = this.extractValues(extractedText);

    const newPdfPath = await this.createPdf(values);

    const uploadResult = await this.uploadToBackblaze(newPdfPath);

    const publicUrl = await this.getTemporaryPublicUrl(uploadResult);

    return publicUrl;
  }

  extractValues(text: string): any {
    const values: any = {};

    // Regex untuk mengekstrak nilai-nilai yang diinginkan
    values.H1 = text.match(/H\.1\s+NOMOR\s*:\s*(\d+)/)?.[1] || '';
    values.H2 = text.match(/H\.2\s*X\s*Pembetulan\s*Ke-\s*(\d+)/)?.[1] || '';
    values.H3 = text.match(/H\.3\s*Pembatalan\s*(.*)/)?.[1] || '';
    values.H4 = text.match(/H\.4\s*X\s*Final\s*(.*)/)?.[1] || '';
    values.H5 = text.match(/H\.5\s*Tidak\s*Final\s*(.*)/)?.[1] || '';
    values.A1 = text.match(/A\.1\s*NPWP\s*([\d\s]+)/)?.[1] || '';
    values.A2 = text.match(/A\.2\s*NIK\s*(.*)/)?.[1] || '';
    values.A3 = text.match(/A\.3\s*Nama\s*([\w\s]+)/)?.[1] || '';
    values.B1 =
      text.match(/B\.1\s*MASA\s*PAJAK\s*\(mm-yyyy\)\s*(\d+)/)?.[1] || '';
    values.B2 = text.match(/B\.2\s*KODE\s*OBJEK\s*PAJAK\s*(\S+)/)?.[1] || '';
    values.B3 =
      text.match(
        /B\.3\s*JUMLAH\s*PENGHASILAN\s*BRUTO\s*\(Rp\)\s*([\d\.]+)/,
      )?.[1] || '';
    values.B4 =
      text.match(
        /B\.4\s*DASAR\s*PENGENAAN\s*PAJAK\s*\(Rp\)\s*([\d\.]+)/,
      )?.[1] || '';
    values.B5 =
      text.match(
        /B\.5\s*TARIF\s*LEBIH\s*TINGGI\s*20%\s*\(TIDAK\s*BER\s*NPWP\)\s*(\d+)/,
      )?.[1] || '';
    values.B6 = text.match(/B\.6\s*TARIF\s*\(%\)\s*(\d+)/)?.[1] || '';
    values.B7 =
      text.match(/B\.7\s*PPh\s*DIPOTONG\/DTP\s*\(Rp\)\s*([\d\.]+)/)?.[1] || '';
    values.B8 =
      text.match(
        /B\.8\s*Dokumen\s*Referensi\s*:\s*Nomor\s*Dokumen\s*(\S+)/,
      )?.[1] || '';
    values.B9 =
      text.match(
        /B\.9\s*\[\]\s*PPh\s*Pasal\s*21\s*dibebaskan\s*dan\s*pemotongan\s*berdasarkan\s*Surat\s*Keterangan\s*Bebas\s*\(SKB\)\.\s*Pembebasan\s*ni\s*berdasarkan\s*SKB\.\s*Nomor\s*(\S+)/,
      )?.[1] || '';
    values.B10 =
      text.match(
        /B\.10\s*\[\]\s*PPh\s*Pasal\s*21\s*ditanggung\s*oleh\s*Pemerintah\s*\(DTP\)\s*berdasarkan\s*(\S+)/,
      )?.[1] || '';
    values.B11 =
      text.match(
        /B\.11\s*PPh\s*yang\s*dipotong\/dipungut\s*yang\s*diberikan\s*fasilitas\s*PPh\s*berdasarkan\s*:\s*(\S+)/,
      )?.[1] || '';
    values.C1 =
      text.match(/C\.1\s*NPWP\s*Instansi\s*Pemerintah\s*([\d\s]+)/)?.[1] || '';
    values.C2 =
      text.match(/C\.2\s*Nama\s*Instansi\s*Pemerintah\s*([\w\s]+)/)?.[1] || '';
    values.C3 =
      text.match(/C\.3\s*ID\s*Subunit\s*Organisasi\s*(\S+)/)?.[1] || '';
    values.C4 = text.match(/C\.4\s*Tanggal\s*([\d\s]+)/)?.[1] || '';
    values.C5 =
      text.match(/C\.5\s*Nama\s*Penandatangan\s*([\w\s]+)/)?.[1] || '';
    values.C6 =
      text.match(/C\.6\s*Pernyataan\s*Wajib\s*Pajak\s*(.*)/)?.[1] || '';

    return values;
  }

  async createPdf(values: any): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const fontSize = 12;
    const lineHeight = 20;
    const xOffset = 100;

    let yPosition = height - 50;

    const drawText = (label: string, value: string) => {
      page.drawText(`${label}:`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(value, {
        x: xOffset,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    };

    drawText('H1', values.H1);
    drawText('H2', values.H2);
    drawText('H3', values.H3);
    drawText('H4', values.H4);
    drawText('H5', values.H5);
    drawText('A1', values.A1);
    drawText('A2', values.A2);
    drawText('A3', values.A3);
    drawText('B1', values.B1);
    drawText('B2', values.B2);
    drawText('B3', values.B3);
    drawText('B4', values.B4);
    drawText('B5', values.B5);
    drawText('B6', values.B6);
    drawText('B7', values.B7);
    drawText('B8', values.B8);
    drawText('B9', values.B9);
    drawText('B10', values.B10);
    drawText('B11', values.B11);
    drawText('C1', values.C1);
    drawText('C2', values.C2);
    drawText('C3', values.C3);
    drawText('C4', values.C4);
    drawText('C5', values.C5);
    drawText('C6', values.C6);

    const pdfBytes = await pdfDoc.save();
    const newPdfPath = `./uploads/extracted_values_${Date.now()}.pdf`;
    fs.writeFileSync(newPdfPath, pdfBytes);

    return newPdfPath;
  }

  async uploadToBackblaze(filePath: string): Promise<string> {
    await this.b2.authorize(); // Autentikasi ke Backblaze B2

    const bucketName = 'dummy-storage';
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    const response = await this.b2.getUploadUrl({
      bucketId: '241598a567c74db690240a12',
    });
    const uploadUrl = response.data.uploadUrl;
    const uploadAuthToken = response.data.authorizationToken;

    const uploadResponse = await this.b2.uploadFile({
      uploadUrl,
      uploadAuthToken,
      fileName,
      data: fileData,
    });

    return `https://f000.backblazeb2.com/file/${bucketName}/${fileName}`;
  }

  async getTemporaryPublicUrl(fileUrl: string): Promise<string> {
    const fileName = path.basename(fileUrl);
    const bucketId = '241598a567c74db690240a12';
    const durationInSeconds = 604800;

    const response = await this.b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: fileName,
      validDurationInSeconds: durationInSeconds,
    });
    // console.log(
    //   '🚀 ~ UploadFileService ~ getTemporaryPublicUrl ~ response:',
    //   response,
    // );

    // const downloadUrl = `https://f000.backblazeb2.com/file/dummy-storage/${fileName}?Authorization=${response.data.authorizationToken}`;
    const downloadUrl = `https://f005.backblazeb2.com/file/dummy-storage/${fileName}?Authorization=${response.data.authorizationToken}`;

    console.log(
      '🚀 ~ UploadFileService ~ getTemporaryPublicUrl ~ downloadUrl:',
      downloadUrl,
    );

    return downloadUrl;
  }
}
