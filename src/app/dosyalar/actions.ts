"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { logAudit } from "@/lib/auditLog";

export async function getFiles() {
  return await prisma.fileAttachment.findMany({
    include: {
      patient: true,
    },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function uploadFile(formData: FormData) {
  try {
    const patientId = formData.get("patientId") as string;
    const fileType = formData.get("fileType") as string;
    const category = formData.get("category") as string || null;
    const description = formData.get("description") as string || null;
    const file = formData.get("file") as File;

    if (!patientId || !fileType || !file) {
      throw new Error("Eksik bilgi veya dosya.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create target directory
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique name to prevent collisions
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${uniqueSuffix}-${sanitizedFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file
    await fs.writeFile(filePath, buffer);

    // Save metadata
    const relativePath = `/uploads/${uniqueFileName}`;
    const fileRecord = await prisma.fileAttachment.create({
      data: {
        patientId,
        fileName: file.name,
        filePath: relativePath,
        fileType,
        category,
        description,
      },
      include: {
        patient: true,
      }
    });

    await logAudit("CREATE", "FileAttachment", fileRecord.id, {
      patientId,
      fileName: file.name,
      fileType,
    });

    revalidatePath("/dosyalar");
    revalidatePath(`/hastalar/${patientId}`);
    return fileRecord;
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    throw new Error("Dosya kaydedilirken sunucu hatası oluştu.");
  }
}

export async function deleteFile(id: string, patientId: string) {
  try {
    const attachment = await prisma.fileAttachment.findUnique({
      where: { id }
    });

    if (attachment) {
      // Try to delete physical file
      const physicalPath = path.join(process.cwd(), "public", attachment.filePath);
      try {
        await fs.unlink(physicalPath);
      } catch (e) {
        console.warn("Fiziksel dosya silinemedi (muhtemelen bulunamadı):", physicalPath);
      }

      // Delete database record
      await prisma.fileAttachment.delete({
        where: { id }
      });

      await logAudit("DELETE", "FileAttachment", id, {
        patientId,
        fileName: attachment.fileName,
      });
    }

    revalidatePath("/dosyalar");
    revalidatePath(`/hastalar/${patientId}`);
  } catch (error) {
    console.error("Dosya silme hatası:", error);
    throw new Error("Dosya silinirken hata oluştu.");
  }
}

