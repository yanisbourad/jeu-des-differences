import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player-service';
import { INDEX_NOT_FOUND } from './consts-player-service';

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerService],
        }).compile();

        service = module.get<PlayerService>(PlayerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('removeRoom() should remove room from the rooms', async () => {
        const roomName = 'room1';
        const getRoomIndexSpy = jest.spyOn(service, 'getRoomIndex').mockResolvedValue(0);
        const spliceSpy = jest.spyOn(service.rooms, 'splice');

        await service.removeRoom(roomName);

        expect(getRoomIndexSpy).toHaveBeenCalledWith(roomName);
        expect(spliceSpy).toHaveBeenCalledWith(0, 1);
    });

    it('getRooms() should return rooms', async () => {
        const mockRooms = [
            {
                name: 'room1',
                host: { socketId: '123', playerName: 'player1' },
                players: [{ socketId: '123', playerName: 'player1' }],
                maxPlayers: 1,
                startTime: new Date(),
            },
            {
                name: 'room2',
                host: { socketId: '123', playerName: 'player2' },
                players: [{ socketId: '123', playerName: 'player2' }],
                maxPlayers: 1,
                startTime: new Date(),
            },
        ];
        service.rooms = mockRooms;
        const rooms = await service.getRooms();
        expect(rooms).toEqual(mockRooms);
    });

    it('getRoom() should return room', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [
            { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime },
            { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime },
        ];
        service.rooms = mockRooms;
        const room = await service.getRoom(mockRoomName);
        expect(room).toEqual(mockRooms[0]);
    });

    it('getRoomIndex() should return room index', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [
            { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime },
            { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime },
        ];
        service.rooms = mockRooms;
        const roomIndex = await service.getRoomIndex(mockRoomName);
        expect(roomIndex).toBe(0);
    });

    it('getRoomIndex() should return -1 if room does not exist', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [
            { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime },
            { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime },
        ];
        service.rooms = mockRooms;
        const roomIndex = await service.getRoomIndex('nonExistingRoom');
        expect(roomIndex).toBe(INDEX_NOT_FOUND);
    });

    it('addRoomSolo() should add room to rooms', async () => {
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const newRoom = { name: 'newRoom', host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime };
        await service.addRoomSolo('newRoom', mockPlayer, mockStartTime);
        expect(service.rooms[0]).toEqual(newRoom);
    });

    it('addRoomMulti() should add room to rooms', async () => {
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const newRoom = {
            name: 'newRoom',
            host: mockPlayer,
            players: [mockPlayer, mockPlayer],
            maxPlayers: 2,
            startTime: mockStartTime,
        };
        await service.addRoomMulti('newRoom', [mockPlayer, mockPlayer], mockStartTime);
        expect(service.rooms[0]).toEqual(newRoom);
    });
});
