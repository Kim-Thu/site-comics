import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function migrateExistingImages() {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory not found');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });

  console.log(`Found ${imageFiles.length} images to migrate`);

  // Get first user as uploader
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('No user found. Please create a user first.');
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const filename of imageFiles) {
    try {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const url = `${process.env.API_URL || 'http://localhost:3001'}/uploads/${filename}`;

      // Check if already exists
      const existing = await prisma.media.findFirst({
        where: { filename }
      } as any);

      if (existing) {
        skipped++;
        continue;
      }

      // Get mime type
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };

      await prisma.media.create({
        data: {
          url,
          filename,
          mimeType: mimeTypes[ext] || 'image/jpeg',
          size: stats.size,
          userId: user.id,
          caption: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        }
      } as any);

      migrated++;
      console.log(`✓ Migrated: ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to migrate ${filename}:`, error);
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
}

migrateExistingImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
