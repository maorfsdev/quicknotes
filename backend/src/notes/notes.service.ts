import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    private cacheService: CacheService,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const note = this.notesRepository.create({
      ...createNoteDto,
      userId,
    });
    
    const savedNote = await this.notesRepository.save(note);
    
    // Invalidate cache for this user
    await this.cacheService.invalidateUserCache(userId);
    
    // Pre-cache the updated notes list for this user
    await this.preCacheUserNotes(userId);
    
    return savedNote;
  }

  async findAll(userId: string, searchQuery?: string): Promise<{ notes: Note[]; fromCache: boolean; cacheKey: string }> {
    // Create cache key
    const cacheKey = this.cacheService.getNotesCacheKey(userId, searchQuery);
    
    // Try to get from cache with metadata
    // Temporarily disable caching to fix refresh issue
    // const cacheResult = await this.cacheService.getWithMetadata<Note[]>(cacheKey);
    // if (cacheResult) {
    //   return {
    //     notes: cacheResult.data,
    //     fromCache: true,
    //     cacheKey: cacheResult.cacheKey,
    //   };
    // }

    // Build query
    const queryBuilder = this.notesRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .orderBy('note.updatedAt', 'DESC');

    // Add search filtering if provided
    if (searchQuery && searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(',').map(term => term.trim()).filter(term => term);
      
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term, index) => 
          `(LOWER(note.title) LIKE :term${index} OR LOWER(note.content) LIKE :term${index} OR note.tags && :tags${index})`
        ).join(' OR ');
        
        queryBuilder.andWhere(`(${searchConditions})`);
        
        // Add parameters for each search term
        searchTerms.forEach((term, index) => {
          queryBuilder.setParameter(`term${index}`, `%${term}%`);
          queryBuilder.setParameter(`tags${index}`, [term]);
        });
      }
    }

    const notes = await queryBuilder.getMany();

    // Cache the results
    // Temporarily disable caching to fix refresh issue
    // await this.cacheService.set(cacheKey, notes);

    return {
      notes,
      fromCache: false,
      cacheKey,
    };
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    
    Object.assign(note, updateNoteDto);
    const updatedNote = await this.notesRepository.save(note);
    
    // Invalidate cache for this user
    await this.cacheService.invalidateUserCache(userId);
    
    // Pre-cache the updated notes list for this user
    await this.preCacheUserNotes(userId);
    
    return updatedNote;
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.findOne(id, userId);
    
    await this.notesRepository.remove(note);
    
    // Invalidate cache for this user
    await this.cacheService.invalidateUserCache(userId);
    
    // Pre-cache the updated notes list for this user
    await this.preCacheUserNotes(userId);
  }

  private async preCacheUserNotes(userId: string): Promise<void> {
    // Get all notes for this user and cache them
    const queryBuilder = this.notesRepository
      .createQueryBuilder('note')
      .where('note.userId = :userId', { userId })
      .orderBy('note.updatedAt', 'DESC');

    const notes = await queryBuilder.getMany();
    
    // Cache the "all notes" query
    const cacheKey = this.cacheService.getNotesCacheKey(userId);
    await this.cacheService.set(cacheKey, notes);
  }
}
