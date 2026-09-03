namespace HappyVeggie.Domain.Entities;

public sealed class AssistantThread
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    public Guid FarmerId { get; set; }

    public string? Title { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastMessageAt { get; set; }

    public bool IsArchived { get; set; }

    public Farm Farm { get; set; } = null!;
    public Farmer Farmer { get; set; } = null!;
    public ICollection<AssistantMessage> Messages { get; set; } = new List<AssistantMessage>();
}
