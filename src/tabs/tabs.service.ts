import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateTabDto } from './dto/create-tab.dto'
import { UpdateTabDto } from './dto/update-tab.dto'
import { PrismaService } from 'src/database/prisma.service'
import { TabResponseDto } from './dto/tab-response.dto'
import { TabWithProjectsResponseDto } from './dto/tab-with-projects-response.dto'

@Injectable()
export class TabsService {
  constructor(private prisma: PrismaService) {}

  async create(createTabDto: CreateTabDto): Promise<TabResponseDto> {
    const existing = await this.prisma.tab.findUnique({
      where: { slug: createTabDto.slug },
      select: { id: true },
    })

    if (existing) throw new ConflictException('Таб с таким slug уже существует')

    const maxOrder = await this.prisma.tab.aggregate({ _max: { order: true } })

    return this.prisma.tab.create({
      data: {
        ...createTabDto,
        order: createTabDto.order ?? (maxOrder._max.order ?? -1) + 1,
      },
      select: { id: true, label: true, slug: true, order: true },
    })
  }

  async findAll(): Promise<TabResponseDto[]> {
    return this.prisma.tab.findMany({
      // where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        label: true,
        slug: true,
        order: true,
        isActive: true,
      },
    })
  }

  async findAllWithProjects(): Promise<TabWithProjectsResponseDto[]> {
    return this.prisma.tab.findMany({
      // where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        label: true,
        slug: true,
        order: true,
        isActive: true,
        projects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            label: true,
            slug: true,
            description: true,
            src: true,
            href: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })
  }

  async findOneWithProjects(id: string): Promise<TabWithProjectsResponseDto> {
    const tab = await this.prisma.tab.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        label: true,
        slug: true,
        order: true,
        projects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            label: true,
            slug: true,
            description: true,
            src: true,
            href: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!tab) throw new NotFoundException(`Таб с id ${id} не найден`)

    return tab
  }

  async findOneBySlug(slug: string): Promise<TabWithProjectsResponseDto> {
    const tab = await this.prisma.tab.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        label: true,
        slug: true,
        order: true,
        projects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            label: true,
            slug: true,
            description: true,
            src: true,
            href: true,
            order: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!tab) throw new NotFoundException(`Таб с slug ${slug} не найден`)

    return tab
  }

  async update(
    id: string,
    updateTabDto: UpdateTabDto,
  ): Promise<TabResponseDto> {
    if (updateTabDto.slug) {
      const existing = await this.prisma.tab.findFirst({
        where: { slug: updateTabDto.slug, NOT: { id } },
        select: { id: true },
      })

      if (existing)
        throw new ConflictException(
          `Таб с таким slug ${updateTabDto.slug} уже существует`,
        )
    }

    return this.prisma.tab.update({
      where: { id },
      data: updateTabDto,
      select: {
        id: true,
        label: true,
        slug: true,
        order: true,
      },
    })
  }

  async remove(id: string) {
    await this.prisma.tab.delete({ where: { id } })
    return { message: 'Таб успешно удален' }
  }

  async reorder(tabIds: string[]): Promise<{ message: string }> {
    const validTabs = await this.prisma.tab.findMany({
      where: { id: { in: tabIds } },
      select: { id: true },
    })

    if (validTabs.length !== tabIds.length) {
      throw new BadRequestException('Некоторые табы не существуют')
    }

    await this.prisma.$transaction(
      tabIds.map((id, index) =>
        this.prisma.tab.update({ where: { id }, data: { order: index } }),
      ),
    )

    return { message: 'Порядок табов обновлён' }
  }
}
