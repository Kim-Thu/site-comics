import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.menu.findMany({ 
        include: { items: true },
        orderBy: { createdAt: 'desc' } 
    } as any);
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
        where: { id },
        include: { 
            items: {
                orderBy: { order: 'asc' }
            } 
        }
    } as any);
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(data: any) {
    return this.prisma.menu.create({ data } as any);
  }

  async update(id: string, data: any) {
    return this.prisma.menu.update({ where: { id }, data } as any);
  }

  async delete(id: string) {
    return this.prisma.menu.delete({ where: { id } } as any);
  }

  async saveItems(menuId: string, items: any[]) {
     console.log('=== SAVE ITEMS CALLED ===');
     console.log('menuId:', menuId);
     console.log('items count:', items?.length || 0);
     
     try {
       return await this.prisma.$transaction(async (prisma: any) => {
           // Step 1: Remove parent references first (to avoid FK constraint)
           console.log('Step 1: Removing parent references...');
           await prisma.menuItem.updateMany({
               where: { menuId },
               data: { parentId: null }
           });
           
           // Step 2: Delete all existing items
           console.log('Step 2: Deleting existing items...');
           await prisma.menuItem.deleteMany({ where: { menuId } });
           
           // Step 3: Create new items recursively
           const createNodes = async (nodes: any[], parentId: string | null = null) => {
               if (!Array.isArray(nodes)) return;
               
               for (const [index, node] of nodes.entries()) {
                   console.log('Creating:', node.title, 'parent:', parentId);
                   const created = await prisma.menuItem.create({
                       data: {
                           menuId,
                           parentId,
                           type: node.type || 'CUSTOM',
                           referenceId: node.referenceId || null,
                           title: node.title || 'Untitled',
                           url: node.url || null,
                           target: node.target || '_self',
                           icon: node.icon || null,
                           displayMode: node.displayMode || 'TEXT_ICON',
                           iconSize: node.iconSize || 'NORMAL',
                           order: index
                       }
                   });
                   
                   if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                       await createNodes(node.children, created.id);
                   }
               }
           };
           
           await createNodes(items || []);
           console.log('=== SAVE ITEMS SUCCESS ===');
           return { success: true };
       });
     } catch (error) {
       console.error('=== SAVE ITEMS ERROR ===');
       console.error(error);
       throw error;
     }
  }
}
