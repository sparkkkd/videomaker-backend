import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectResponseDto } from './dto/project-response.dto'
import { PrismaService } from 'src/database/prisma.service'
import { ProjectWithTabResponseDto } from './dto/project-with-tab-response.dto'
import { UploadsService } from 'src/uploads/uploads.service'

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const existing = await this.prisma.project.findUnique({
      where: { slug: createProjectDto.slug },
      select: { id: true },
    })

    if (existing)
      throw new ConflictException(
        `Проект с таким slug (${createProjectDto.slug}) уже существует`,
      )

    const tab = await this.prisma.tab.findUnique({
      where: { id: createProjectDto.tabId },
      select: { id: true },
    })

    if (!tab)
      throw new NotFoundException(
        `Таб с ID ${createProjectDto.tabId} не найден`,
      )

    const maxOrder = await this.prisma.project.aggregate({
      _max: { order: true },
      where: { tabId: createProjectDto.tabId },
    })

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        href: createProjectDto.href || null,
        order: createProjectDto.order ?? (maxOrder._max.order ?? -1) + 1,
      },
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
    })

    await this.uploadsService.linkFile(project.src)

    return project
  }

  async findAll(): Promise<ProjectWithTabResponseDto[]> {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        label: true,
        slug: true,
        description: true,
        src: true,
        href: true,
        order: true,
        tab: { select: { id: true, label: true, slug: true } },
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findAllByTabId(tabId: string) {
    return this.prisma.project.findMany({
      where: { tabId },
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
    })
  }

  async findOne(id: string): Promise<ProjectWithTabResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        label: true,
        slug: true,
        description: true,
        src: true,
        href: true,
        order: true,
        tab: { select: { id: true, label: true, slug: true } },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!project) throw new NotFoundException(`Проект с ID ${id} не найден`)

    return project
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    if (updateProjectDto.slug) {
      const existing = await this.prisma.project.findFirst({
        where: { slug: updateProjectDto.slug, NOT: { id } },
        select: { id: true },
      })
      if (existing)
        throw new ConflictException('Проект с таким slug уже существует')
    }

    const oldProject = await this.prisma.project.findUnique({
      where: { id },
      select: { src: true },
    })

    if (!oldProject) {
      throw new NotFoundException(`Проект с ID ${id} не найден`)
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        ...updateProjectDto,
        href: updateProjectDto.href === '' ? null : updateProjectDto.href,
      },
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
    })

    if (oldProject?.src !== updatedProject.src) {
      await this.uploadsService.unlinkFile(oldProject.src)
      await this.uploadsService.linkFile(updatedProject.src)
    }

    return updatedProject
  }

  async remove(id: string): Promise<{ message: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { src: true },
    })

    if (!project) throw new NotFoundException(`Проект с ID ${id} не найден`)

    await this.prisma.project.delete({ where: { id } })
    await this.uploadsService.unlinkFile(project.src)

    return { message: 'Проект успешно удалён' }
  }

  async reorder(
    projectIds: string[],
    tabId: string,
  ): Promise<{ message: string }> {
    const validProjects = await this.prisma.project.findMany({
      where: { id: { in: projectIds }, tabId },
      select: { id: true },
    })

    if (validProjects.length !== projectIds.length) {
      throw new BadRequestException(
        'Некоторые проекты не принадлежат указанному табу',
      )
    }

    await this.prisma.$transaction(
      projectIds.map((id, index) =>
        this.prisma.project.update({ where: { id }, data: { order: index } }),
      ),
    )

    return { message: 'Порядок проектов обновлён' }
  }
}
