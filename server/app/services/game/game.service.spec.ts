import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CourseService } from './game.service';

import { Course, CourseDocument } from '@app/model/database/course';
import { getModelToken } from '@nestjs/mongoose';

/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe CourseService) or
 * - Use mongodb memory server implementation (see describe CourseServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('CourseService', () => {
    let service: CourseService;
    let courseModel: Model<CourseDocument>;

    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        courseModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<CourseDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CourseService,
                Logger,
                {
                    provide: getModelToken(Course.name),
                    useValue: courseModel,
                },
            ],
        }).compile();

        service = module.get<CourseService>(CourseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
