import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FiguresService } from './figures.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('figures')
export class FiguresController {
  constructor(private readonly figuresService: FiguresService) {}

  @Get()
  async findAll(@Query('collectionId') collectionId?: string) {
    return this.figuresService.findAll(collectionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.figuresService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() createDto: { title: string; description?: string; image?: string; publicId?: string; gramsUsed?: number; price?: number; stock?: number; collectionIds?: string[] }) {
    return this.figuresService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: { title?: string; description?: string; image?: string; publicId?: string; gramsUsed?: number; price?: number; stock?: number; collectionIds?: string[] },
  ) {
    return this.figuresService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.figuresService.delete(id);
  }
}
