using HappyVeggie.Domain.Enums;

namespace HappyVeggie.Domain.Entities;

public sealed class AssistantMessage
{
    public Guid Id { get; set; }

    public Guid ThreadId { get; set; }

    public MessageRole Role { get; set; }

    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Optional JSON array of citation references used by the assistant.
    /// </summary>
    public string? CitationsJson { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public AssistantThread Thread { get; set; } = null!;
}
