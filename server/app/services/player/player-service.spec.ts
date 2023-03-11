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

    // to change
    // it('addPlayerSolo() should add player to the room', async () => {
    //     const mockRoomName = 'mockRoom';
    //     const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
    //     const mockStartTime = new Date();
    //     jest.spyOn(service, 'validatePlayer').mockReturnValue(true);
    //     const mockRooms = [{ name: mockRoomName, host: mockPlayer, players: [], maxPlayers: 0, startTime: mockStartTime }];
    //     service.rooms = mockRooms;
    //     service.rooms[0].maxPlayers++;
    //     await service.addPlayer(mockRoomName, mockPlayer, mockStartTime);
    //     expect(service.rooms[0].players).toContainEqual(mockPlayer);
    //     expect(await service.getRoomIndex(mockRoomName)).toBe(0);
    // });

    // to change
    // it('addPlayer() should create a new room if the current room is full or the player is already in the room', async () => {
    //     const mockRoomName = 'mockRoom';
    //     const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
    //     const mockStartTime = new Date();
    //     jest.spyOn(service, 'validatePlayer').mockReturnValue(false);
    //     const mockRooms = [{ name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 0, startTime: mockStartTime }];
    //     service.rooms = mockRooms;
    //     await service.addPlayer(mockRoomName, mockPlayer, mockStartTime);
    //     expect(service.rooms[1].players).toContainEqual(mockPlayer);
    //     expect(service.rooms[1].maxPlayers).toBe(0);
    //     expect((await service.getRooms()).length).toBe(2);
    // });

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

    // it('validatePlayer() should return true if player is not in the room', async () => {
    //     const mockRoomName = 'mockRoom';
    //     const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
    //     const mockStartTime = new Date();
    //     const mockRooms = [
    //         { name: mockRoomName, host: mockPlayer, players: [], maxPlayers: 0, startTime: mockStartTime },
    //         { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 0, startTime: mockStartTime },
    //     ];
    //     service.rooms = mockRooms;
    //     const isValid = service.validatePlayer(0, mockPlayer);
    //     expect(isValid).toBe(true);
    // });

    // it('validatePlayer() should return false if player name is in the room', async () => {
    //     const mockRoomName = 'mockRoom';
    //     const mockPlayer = { socketId: '', playerName: 'mockPlayerName' };
    //     const fakePlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
    //     const mockStartTime = new Date();
    //     const mockRooms = [
    //         { name: mockRoomName, host: mockPlayer, players: [fakePlayer], maxPlayers: 0, startTime: mockStartTime },
    //         { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 0, startTime: mockStartTime },
    //     ];
    //     service.rooms = mockRooms;
    //     const isValid = service.validatePlayer(0, mockPlayer);
    //     expect(isValid).toBe(false);
    // });

    // it('validatePlayer() should be false if room does not exist', async () => {
    //     const mockRoomName = 'mockRoom';
    //     const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
    //     const mockStartTime = new Date();
    //     const mockRooms = [
    //         { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 0, startTime: mockStartTime },
    //         { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 0, startTime: mockStartTime },
    //     ];
    //     service.rooms = mockRooms;
    //     expect(service.rooms[2]).toBeUndefined();
    //     expect(service.validatePlayer(2, mockPlayer)).toBeFalsy();
    // });

    // it('validatePlayer() should return false if room is full', async () => {
    //     const mockRoomName = 'mockRoom';
    //     const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
    //     const mockStartTime = new Date();
    //     const mockRooms = [
    //         { name: mockRoomName, host: mockPlayer, players: [mockPlayer], maxPlayers: 0, startTime: mockStartTime },
    //         { name: mockRoomName, host: mockPlayer, players: [mockPlayer, mockPlayer], maxPlayers: 0, startTime: mockStartTime },
    //     ];
    //     service.rooms = mockRooms;
    //     const isValid = service.validatePlayer(1, mockPlayer);
    //     expect(isValid).toBe(false);
    // });

    it('addRoomSolo() should add room to rooms', async () => {
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const newRoom = { name: 'newRoom', host: mockPlayer, players: [mockPlayer], maxPlayers: 1, startTime: mockStartTime };
        await service.addRoomSolo('newRoom', mockPlayer, mockStartTime);
        expect(service.rooms[0]).toEqual(newRoom);
    });
});
