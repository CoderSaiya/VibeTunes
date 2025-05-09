using System.ComponentModel.DataAnnotations.Schema;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.ValueObjects;

namespace VibeTunes.Domain.Entities;

public sealed class Profile : BaseEntity
{
    public Guid UserId { get; init; }
    [ForeignKey("UserId")]
    public User User { get; init; }

    public Name? Name { get; set; }
    public Address? Address { get; set; }
    public Gender? Gender { get; set; }
    public string? Avatar { get; set; } = "https://i.pinimg.com/236x/23/bb/df/23bbdf32fbf463583ecf1b078d5c13e8.jpg";
}