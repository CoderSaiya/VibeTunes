using System.ComponentModel;

namespace VibeTunes.Application.Models;

public enum PlaybackState
{
    [Description("Dừng")]
    Stopped,
    
    [Description("Đang phát")]
    Playing,
    
    [Description("Tạm dừng")]
    Paused
}