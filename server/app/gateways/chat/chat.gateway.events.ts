export enum ChatEvents {
    Connect = 'connect',
    Message = 'message',
    Validate = 'validate',
    BroadcastAll = 'broadcastAll',
    JoinRoom = 'joinRoom',
    LeaveRoom = 'leaveRoom',
    RoomMessage = 'roomMessage',
    MassMessage = 'massMessage',
    Hello = 'hello',
    Clock = 'clock',
    StartTimer = 'startTimer',//remove if unused
    StopTimer = 'stopTimer',
    AddTime = 'addTime',
    Time = 'time',
    Hint = 'hint',
    Error = 'error',
    DifferenceFound = 'found',
}
