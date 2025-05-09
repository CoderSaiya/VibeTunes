using System.Collections.Concurrent;
using System.ComponentModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.Models;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Infrastructure.Hubs;

// [Authorize]
public class MusicHub(ISongRepository songRepository) : Hub
{
    private static readonly ConcurrentDictionary<Guid, MusicRoom> _musicRooms = new();
    private static readonly ConcurrentDictionary<Guid, Guid> _userRooms = new();
    
    public static IEnumerable<RoomInfoDto> GetAllRooms()
    {
        return _musicRooms.Values
            .Select(r => new RoomInfoDto(
                r.RoomId,
                r.Name,
                r.Participants.Count
            ));
    }
    
    private Guid? GetUserId()
    {
        var qs = Context.GetHttpContext()?
            .Request.Query["userId"].FirstOrDefault();
        return Guid.TryParse(qs, out var g) ? g : (Guid?)null;
    }
    
    public async Task CreateRoom(string roomName)
    {
        var hostId  = GetUserId();
        if (hostId  is null)
        {
            await Clients.Caller.SendAsync("Error", "Người dùng không tồn tại");
            return;
        }
        
        Console.WriteLine($"ABCABC");

        if (_userRooms.ContainsKey(hostId.Value))
        {
            await Clients.Caller.SendAsync("Error", "Bạn đang trong phòng khác");
            return;
        }

        var roomId = Guid.NewGuid();
        
        var newRoom = new MusicRoom(
            RoomId: roomId,
            HostId: hostId.Value,
            Name: roomName,
            Participants: new List<Guid> { hostId.Value },
            CurrentSong: null,
            PlaybackState: PlaybackState.Stopped
        );

        _musicRooms[roomId] = newRoom;
        _userRooms[hostId.Value] = roomId;

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
        
        Console.WriteLine($"Create room {roomId}");
        await Clients.Caller.SendAsync("RoomCreated", roomId);
    }
    
    public async Task JoinRoom(Guid roomId)
    {
        var userId = Context.UserIdentifier;
        if (userId is null)
        {
            await Clients.Caller.SendAsync("Error", "Người dùng không tồn tại");
            return;
        }
        
        var userIdg = Guid.Parse(userId);

        if (_userRooms.ContainsKey(userIdg))
        {
            await Clients.Caller.SendAsync("Error", "Bạn đang trong phòng khác");
            return;
        }

        if (!_musicRooms.TryGetValue(roomId, out var room))
        {
            await Clients.Caller.SendAsync("Error", "Phòng không tồn tại");
            return;
        }

        room.Participants.Add(userIdg);
        _userRooms[userIdg] = roomId;

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId.ToString());
        await Clients.Group(roomId.ToString()).SendAsync("UserJoined", userIdg);
        await Clients.Caller.SendAsync("RoomJoined", roomId);
    }
    
    public async Task LeaveRoom()
    {
        var userId = Context.UserIdentifier;
        if (userId is null)
        {
            await Clients.Caller.SendAsync("Error", "Người dùng không tồn tại");
            return;
        }
        var userIdg = Guid.Parse(userId);
        
        if (!_userRooms.TryRemove(userIdg, out var roomId)) return;

        if (!_musicRooms.TryGetValue(roomId, out var room)) return;

        if (room.HostId == userIdg)
        {
            await CloseRoom(roomId);
            return;
        }

        room.Participants.Remove(userIdg);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId.ToString());
        await Clients.Group(roomId.ToString()).SendAsync("UserLeft", userIdg);
    }
    
    [HubMethodName("UpdatePlayback")]
    public async Task UpdatePlayback(string stateStr, string songId, double time)
    {
        try
        {
            if (!Enum.TryParse(stateStr, true, out PlaybackState state))
            {
                await Clients.Caller.SendAsync("Error", "Trạng thái playback không hợp lệ");
                return;
            }
            
            // 1. Kiểm tra user
            var userId = Context.UserIdentifier;
            if (userId is null)
            {
                await Clients.Caller.SendAsync("Error", "Người dùng không tồn tại");
                return;
            }
            var userGuid = Guid.Parse(userId);

            // 2. Kiểm tra đã vào phòng chưa
            if (!_userRooms.TryGetValue(userGuid, out var roomId))
            {
                await Clients.Caller.SendAsync("Error", "Bạn chưa tham gia phòng");
                return;
            }

            // 3. Lấy room
            if (!_musicRooms.TryGetValue(roomId, out var room))
            {
                await Clients.Caller.SendAsync("Error", "Phòng không tồn tại");
                return;
            }

            // 4. Chỉ host mới được quyền
            if (room.HostId != userGuid)
            {
                await Clients.Caller.SendAsync("Error", "Chỉ host mới có thể cập nhật playback");
                return;
            }
            
            // 5. Lấy bài hát
            var song = await songRepository.GetSongByIdAsync(Guid.Parse(songId));
            if (song is null)
            {
                await Clients.Caller.SendAsync("Error", "Bài hát không tìm thấy");
                return;
            }

            // 6. Cập nhật
            var updatedRoom = room with
            {
                CurrentSong = song,
                PlaybackState = state,
                CurrentTime = time
            };
            _musicRooms[roomId] = updatedRoom;

            // 7. Gửi cho cả nhóm
            await Clients.Group(roomId.ToString())
                .SendAsync("PlaybackUpdated", GetDescription(state), song, time);
        }
        catch (Exception ex)
        {
            // Báo lỗi chi tiết ra client để debug
            await Clients.Caller.SendAsync("Error", $"UpdatePlayback thất bại: {ex.Message}");
        }
    }
    
    private async Task CloseRoom(Guid roomId)
    {
        if (!_musicRooms.TryRemove(roomId, out var room)) return;

        foreach (var user in room.Participants)
        {
            _userRooms.TryRemove(user, out _);
        }

        var roomIds = roomId.ToString();

        await Clients.Group(roomIds).SendAsync("RoomClosed");
        await Clients.Group(roomIds).SendAsync("PlaybackStopped");
    }
    
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await LeaveRoom();
        await base.OnDisconnectedAsync(exception);
    }
    
    private static string GetDescription(Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = (DescriptionAttribute)Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute));
        return attribute?.Description ?? value.ToString();
    }
}