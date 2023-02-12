import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player-service';

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

    it('addPlayer() should add player to the room', async () => { // doesn't work
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        //const rIndex = await service.getRoomIndex(mockRoomName);
        //const getRoomIndexSpy = jest.spyOn(service, 'getRoomIndex').mockResolvedValue(0);
        jest.spyOn(service, 'validatePlayer').mockReturnValue(true);
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}, 
                           { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const addRoomSpy = jest.spyOn(service, 'addRoom').mockImplementation();
        service.rooms[0].maxPlayers++;
        service.addPlayer(mockRoomName, mockPlayer, mockStartTime);

        expect(service.rooms[0].players).toContainEqual(mockPlayer);
        expect(service.rooms[0].maxPlayers).toBe(1);
        expect(service.getRoomIndex(mockRoomName)).toBe(0);

        //getRoomIndexSpy.mockRestore();
        //addRoomSpy.mockRestore();
    });


    it('addPlayer() should create a new room if the current room is full or the player is already in the room', async () => { // doesn't work
        const mockRoomName = 'mockRoom'; 
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        //const rIndex = await service.getRoomIndex(mockRoomName);
        //const getRoomIndexSpy = jest.spyOn(service, 'getRoomIndex').mockResolvedValue(0);
        jest.spyOn(service, 'validatePlayer').mockReturnValue(false);
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                            { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const addRoomSpy = jest.spyOn(service, 'addRoom').mockImplementation();
        service.rooms[0].maxPlayers++;
        service.addPlayer(mockRoomName, mockPlayer, mockStartTime);

        expect(service.rooms[0].players).toContainEqual(mockPlayer);
        expect(service.rooms[0].maxPlayers).toBe(1);
        expect(service.getRoomIndex(mockRoomName)).toBe(0);

        //getRoomIndexSpy.mockRestore();
        //addRoomSpy.mockRestore();
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
        const mockRooms = [{ name: 'room1',  host: { socketId: '123', playerName: 'player1' }, players: [{ socketId: '123', playerName: 'player1' }], maxPlayers: 0 , startTime: new Date()},
                            { name: 'room2',  host: { socketId: '123', playerName: 'player2' }, players: [{ socketId: '123', playerName: 'player2' }], maxPlayers: 0 , startTime: new Date()}];
        service.rooms = mockRooms;
        const rooms = await service.getRooms();
        expect(rooms).toEqual(mockRooms);
    });

    it('getRoom() should return room', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                            { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const room = await service.getRoom(mockRoomName);
        expect(room).toEqual(mockRooms[0]);
    });

    it('getRoomIndex() should return room index', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                            { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const roomIndex = await service.getRoomIndex(mockRoomName);
        expect(roomIndex).toBe(0);
    });

    it('getRoomIndex() should return -1 if room does not exist', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                            { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const roomIndex = await service.getRoomIndex('nonExistingRoom');
        expect(roomIndex).toBe(-1);
    });

    it('validatePlayer() should return true if player is not in the room', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const fakePlayer = { socketId: 'testSocketId', playerName: 'testPlayer' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                           { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const isValid = service.validatePlayer(0, fakePlayer);
        expect(isValid).toBe(true);
    });

    it('validatePlayer() should return false if player is in the room', async () => { // doesn't work
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                           { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const isValid = service.validatePlayer(0, mockPlayer);
        expect(isValid).toBe(false);
    });

    it('validatePlayer() should be false if room does not exist', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                            { name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        expect(service.rooms[2]).toBeUndefined();
        expect(service.validatePlayer(2, mockPlayer)).toBeFalsy();
    });

    it('validatePlayer() should return false if room is full', async () => {
        const mockRoomName = 'mockRoom';
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const mockRooms = [{ name: mockRoomName,  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime},
                           { name: mockRoomName,  host: mockPlayer, players: [mockPlayer, mockPlayer], maxPlayers: 0 , startTime: mockStartTime}];
        service.rooms = mockRooms;
        const isValid = service.validatePlayer(1, mockPlayer);
        expect(isValid).toBe(false);
    });

    it('addRoom() should add room to rooms', async () => {
        const mockPlayer = { socketId: 'mockSocketId', playerName: 'mockPlayerName' };
        const mockStartTime = new Date();
        const newRoom = { name: 'newRoom',  host: mockPlayer, players: [mockPlayer], maxPlayers: 0 , startTime: mockStartTime};
        await service.addRoom('newRoom', mockPlayer, mockStartTime);
        expect(service.rooms[0]).toEqual(newRoom);
    });

    /**
    
       it('should add a player to a room if the room is not full and the player is not already in the room', async () => {
        const roomName = 'room1';
        const player = { socketId: '123', playerName: 'player1' };
        const startTime = new Date();

        const rIndex = await this.getRoomIndex(roomName);

        expect(this.rooms[rIndex].players.length).toBeLessThan(this.maxPlayers);
        expect(this.rooms[rIndex].players.findIndex((p) => p?.socketId === player.socketId)).toEqual(-1);
        expect(this.rooms[rIndex].players.findIndex((p) => p?.playerName === player.playerName)).toEqual(-1);

        await this.addPlayer(roomName, player, startTime);

        expect(this.rooms[rIndex].players).toContainEqual(player);
    });

    it('should create a new room if the current room is full or the player is already in the room', async () => {
        const roomName = 'room2';
        const player = { socketId: '123', playerName: 'player2' };
        const startTime = new Date();

        await this.addPlayer(roomName, player, startTime);

        expect(this.rooms).toContainEqual({ name: roomName, players: [player], maxPlayers: 1 });
    }); */

    // it('should add player to the room', () => {});
    /**
to test : 
     
        addRoom 
        addPlayer 
     */
});
