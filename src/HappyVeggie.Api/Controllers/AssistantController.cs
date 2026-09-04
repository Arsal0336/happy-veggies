using System.Security.Claims;
using System.Text.Json;
using HappyVeggie.Application.AI.Services;
using HappyVeggie.Application.Common.Interfaces;
using HappyVeggie.Application.Common.Services;
using HappyVeggie.Api.RateLimiting;
using HappyVeggie.Domain.Entities;
using HappyVeggie.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace HappyVeggie.Api.Controllers;

[ApiController]
[Route("api/v1/farms/{farmId:guid}/assistant")]
[Authorize(Roles = "Farmer")]
public sealed class AssistantController : ControllerBase
{
    private readonly IApplicationDbContext _db;
    private readonly FarmOwnershipGuard _ownershipGuard;
    private readonly FarmAssistantService _assistant;

    public AssistantController(IApplicationDbContext db, FarmOwnershipGuard ownershipGuard, FarmAssistantService assistant)
    {
        _db = db;
        _ownershipGuard = ownershipGuard;
        _assistant = assistant;
    }

    private Guid GetFarmerId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("threads")]
    public async Task<IActionResult> ListThreads(Guid farmId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var threadRows = await _db.AssistantThreads.AsNoTracking()
            .Where(t => t.FarmId == farmId && !t.IsArchived)
            .Select(t => new { t.Id, t.Title, t.CreatedAt, t.LastMessageAt })
            .ToListAsync(cancellationToken);

        var threads = threadRows
            .OrderByDescending(t => t.LastMessageAt ?? t.CreatedAt)
            .ToList();

        return Ok(threads);
    }

    [HttpPost("threads")]
    public async Task<IActionResult> StartThread(
        Guid farmId,
        [FromBody] StartThreadRequest body,
        CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var thread = new AssistantThread
        {
            Id = Guid.NewGuid(),
            FarmId = farmId,
            FarmerId = GetFarmerId(),
            Title = body.Title,
            CreatedAt = now
        };
        _db.AssistantThreads.Add(thread);
        await _db.SaveChangesAsync(cancellationToken);

        return Created($"api/v1/farms/{farmId}/assistant/threads/{thread.Id}", new { thread.Id, thread.Title, thread.CreatedAt });
    }

    [HttpGet("threads/{threadId:guid}")]
    public async Task<IActionResult> GetThread(
        Guid farmId, Guid threadId, CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var thread = await _db.AssistantThreads.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == threadId && t.FarmId == farmId, cancellationToken)
            ?? throw new KeyNotFoundException($"Thread {threadId} not found.");

        var messageRows = await _db.AssistantMessages.AsNoTracking()
            .Where(m => m.ThreadId == threadId)
            .Select(m => new { m.Id, m.Role, m.Content, m.CitationsJson, m.CreatedAt })
            .ToListAsync(cancellationToken);

        var messages = messageRows.OrderBy(m => m.CreatedAt).ToList();

        return Ok(new { thread.Id, thread.Title, thread.CreatedAt, Messages = messages });
    }

    [HttpPost("threads/{threadId:guid}/messages")]
    [EnableRateLimiting(RateLimitingExtensions.AssistantPolicy)]
    public async Task<IActionResult> PostMessage(
        Guid farmId, Guid threadId,
        [FromBody] PostMessageRequest body,
        CancellationToken cancellationToken)
    {
        await _ownershipGuard.EnsureOwnerAsync(farmId, cancellationToken);

        var thread = await _db.AssistantThreads
            .FirstOrDefaultAsync(t => t.Id == threadId && t.FarmId == farmId, cancellationToken)
            ?? throw new KeyNotFoundException($"Thread {threadId} not found.");

        var now = DateTimeOffset.UtcNow;

        // Get farmer language
        var farmForLang = await _db.Farms.AsNoTracking()
            .FirstAsync(f => f.Id == farmId, cancellationToken);
        var farmerForLang = await _db.Farmers.AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == farmForLang.FarmerId, cancellationToken);

        // Call AI first so a provider failure does not leave a half-saved turn.
        var reply = await _assistant.RespondAsync(
            farmId, threadId, body.Text, farmerForLang?.Language ?? "en", cancellationToken);

        var userMsg = new AssistantMessage
        {
            Id = Guid.NewGuid(),
            ThreadId = threadId,
            Role = MessageRole.User,
            Content = body.Text,
            CreatedAt = now
        };
        _db.AssistantMessages.Add(userMsg);

        var assistantMsg = new AssistantMessage
        {
            Id = Guid.NewGuid(),
            ThreadId = threadId,
            Role = MessageRole.Assistant,
            Content = reply.Content,
            CitationsJson = JsonSerializer.Serialize(new
            {
                citations = reply.Citations,
                followUps = reply.FollowUpQuestions
            }),
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.AssistantMessages.Add(assistantMsg);

        thread.LastMessageAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            Message = new
            {
                assistantMsg.Id,
                assistantMsg.Role,
                assistantMsg.Content,
                assistantMsg.CitationsJson,
                assistantMsg.CreatedAt,
                Disclaimer = reply.Disclaimer,
                FollowUpQuestions = reply.FollowUpQuestions
            },
            Disclaimer = reply.Disclaimer,
            FollowUpQuestions = reply.FollowUpQuestions
        });
    }
}

public sealed record StartThreadRequest(string? Title);
public sealed record PostMessageRequest(string Text);
