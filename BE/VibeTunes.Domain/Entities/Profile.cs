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
    public string? Avatar { get; set; } = "/img/logo.png";
}