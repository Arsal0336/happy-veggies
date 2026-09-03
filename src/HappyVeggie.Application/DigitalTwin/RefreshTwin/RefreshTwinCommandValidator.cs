using FluentValidation;

namespace HappyVeggie.Application.DigitalTwin.RefreshTwin;

public sealed class RefreshTwinCommandValidator : AbstractValidator<RefreshTwinCommand>
{
    public RefreshTwinCommandValidator()
    {
        RuleFor(x => x.FarmId).NotEmpty();
    }
}
