import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMICS_DATA = [
  {
    title: 'Shadow Blade: Eternal Night',
    slug: 'shadow-blade-eternal-night',
    thumbnail: 'https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=400&auto=format&fit=crop', // Replaced local path with placeholder for demo
    banner: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1200&auto=format&fit=crop',
    description: 'Trong một thế giới bị bao phủ bởi bóng đêm vĩnh cửu...',
    author: 'Ginger Art',
    status: 'ongoing',
    rating: 4.8,
    views: 1200000,
    categories: ['Action', 'Fantasy']
  },
  {
    title: 'Eternal Whispers',
    slug: 'eternal-whispers',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    description: 'Tiếng thì thầm của vĩnh cửu...',
    author: 'Studio Moon',
    status: 'ongoing',
    rating: 4.9,
    views: 850000,
    categories: ['Romance', 'Fantasy']
  },
  {
    title: 'Thần Ma Quyết',
    slug: 'than-ma-quyet',
    thumbnail: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=400&auto=format&fit=crop',
    description: 'Quyết chiến thần ma đỉnh cao.',
    author: 'Unknown',
    status: 'completed',
    rating: 4.5,
    views: 2500000,
    categories: ['Action', 'Martial Arts']
  },
  {
    title: 'Vương Giả Trở Lại',
    slug: 'vuong-gia-tro-lai',
    thumbnail: 'https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?q=80&w=400&auto=format&fit=crop',
    author: 'King Arts',
    status: 'ongoing',
    rating: 4.2,
    views: 150000,
    categories: ['Adventure']
  },
  {
    title: 'Kiếm Đạo Độc Tôn',
    slug: 'kiem-dao-doc-ton',
    thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop',
    author: 'Sword Master',
    status: 'ongoing',
    rating: 4.7,
    views: 10000000,
    categories: ['Martial Arts', 'Action']
  },
  {
    title: 'Sát Thủ Học Đường',
    slug: 'sat-thu-hoc-duong',
    thumbnail: 'https://images.unsplash.com/photo-1508898578281-774ac4893c0c?q=80&w=400&auto=format&fit=crop',
    author: 'School Life Team',
    status: 'ongoing',
    rating: 4.6,
    views: 1100000,
    categories: ['School Life', 'Action']
  }
];

const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

async function main() {
  console.log('Start seeding ...');

  for (const comicData of COMICS_DATA) {
    const { categories, ...rest } = comicData;

    // Create or connect categories
    const categoryIds: string[] = [];
    for (const catName of categories) {
      const slug = catName.toLowerCase().replace(/ /g, '-');
      const category = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: {
          name: catName,
          slug,
        },
      });
      categoryIds.push(category.id);
    }

    const searchTitle = removeAccents(rest.title);

    const comic = await prisma.comic.upsert({
      where: { slug: rest.slug },
      update: {
          ...rest,
          searchTitle,
          categoryIds: categoryIds, 
      },
      create: {
        ...rest,
        searchTitle,
        categoryIds: categoryIds,
      },
    });

    // Create dummy chapters
    const chapterCount = 10;
    for (let i = 1; i <= chapterCount; i++) {
        const chSlug = `chapter-${i}`;
        await prisma.chapter.upsert({
            where: {
                comicId_slug: {
                    comicId: comic.id,
                    slug: chSlug
                }
            },
            update: {},
            create: {
                number: i,
                slug: chSlug,
                title: `Chương ${i}`,
                images: [],
                comicId: comic.id
            }
        });
    }

    console.log(`Upserted comic: ${comic.title}`);
  }

  // Create Admin User
  const adminEmail = 'admin@truyenmoi.com';
  const hashedPassword = await require('bcrypt').hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Ginger Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Upserted admin user: ${adminEmail}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
