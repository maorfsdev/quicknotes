import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { CacheService } from '../cache/cache.service';
import { Note } from './entities/note.entity';

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: Repository<Note>;
  let cacheService: CacheService;

  const mockNote: Note = {
    id: '1',
    userId: 'user1',
    title: 'Test Note',
    content: 'Test content',
    tags: ['test', 'example'],
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
            remove: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            invalidateUserCache: jest.fn(),
            getNotesCacheKey: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    notesRepository = module.get<Repository<Note>>(getRepositoryToken(Note));
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createNoteDto = {
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
      };

      jest.spyOn(notesRepository, 'create').mockReturnValue(mockNote);
      jest.spyOn(notesRepository, 'save').mockResolvedValue(mockNote);
      jest.spyOn(cacheService, 'invalidateUserCache').mockResolvedValue();

      const result = await service.create(createNoteDto, 'user1');

      expect(result).toEqual(mockNote);
      expect(notesRepository.create).toHaveBeenCalledWith({
        ...createNoteDto,
        userId: 'user1',
      });
      expect(cacheService.invalidateUserCache).toHaveBeenCalledWith('user1');
    });
  });

  describe('findAll', () => {
    it('should return cached notes if available', async () => {
      const cachedNotes = [mockNote];
      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedNotes);
      jest.spyOn(cacheService, 'getNotesCacheKey').mockReturnValue('cache-key');

      const result = await service.findAll('user1', 'test');

      expect(result).toEqual(cachedNotes);
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
    });

    it('should query database and cache result if not cached', async () => {
      const notes = [mockNote];
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(cacheService, 'getNotesCacheKey').mockReturnValue('cache-key');
      jest.spyOn(cacheService, 'set').mockResolvedValue();

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(notes),
      };

      jest.spyOn(notesRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll('user1', 'test');

      expect(result).toEqual(notes);
      expect(cacheService.set).toHaveBeenCalledWith('cache-key', notes);
    });
  });

  describe('findOne', () => {
    it('should return note if found', async () => {
      jest.spyOn(notesRepository, 'findOne').mockResolvedValue(mockNote);

      const result = await service.findOne('1', 'user1');

      expect(result).toEqual(mockNote);
      expect(notesRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
      });
    });

    it('should throw NotFoundException if note not found', async () => {
      jest.spyOn(notesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update note successfully', async () => {
      const updateNoteDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockNote);
      jest.spyOn(notesRepository, 'save').mockResolvedValue({ ...mockNote, ...updateNoteDto });
      jest.spyOn(cacheService, 'invalidateUserCache').mockResolvedValue();

      const result = await service.update('1', updateNoteDto, 'user1');

      expect(result).toEqual({ ...mockNote, ...updateNoteDto });
      expect(cacheService.invalidateUserCache).toHaveBeenCalledWith('user1');
    });
  });

  describe('remove', () => {
    it('should remove note successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockNote);
      jest.spyOn(notesRepository, 'remove').mockResolvedValue(mockNote);
      jest.spyOn(cacheService, 'invalidateUserCache').mockResolvedValue();

      await service.remove('1', 'user1');

      expect(notesRepository.remove).toHaveBeenCalledWith(mockNote);
      expect(cacheService.invalidateUserCache).toHaveBeenCalledWith('user1');
    });
  });
});
