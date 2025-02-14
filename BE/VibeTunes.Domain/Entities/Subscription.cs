using VibeTunes.Domain.Common;

namespace VibeTunes.Domain.Entities;

public class Subscription : BaseEntity
{
    public string Name { get; set; }
    public int Price {get; set;}
    public int Duration { get; set; }
    public string[] Tags { get; set; }
    public string[] Benefits { get; set; }
}