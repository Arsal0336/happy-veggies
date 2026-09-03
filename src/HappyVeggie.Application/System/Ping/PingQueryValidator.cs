using FluentValidation;

namespace HappyVeggie.Application.System.Ping;

public sealed class PingQueryValidator : AbstractValidator<PingQuery>
{
    public PingQueryValidator()
    {
    }
}
