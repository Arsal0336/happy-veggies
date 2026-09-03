using FluentValidation;

namespace HappyVeggie.Application.CropZones.CreateCropZone;

public sealed class CreateCropZoneCommandValidator : AbstractValidator<CreateCropZoneCommand>
{
    public CreateCropZoneCommandValidator()
    {
        RuleFor(x => x.FarmId).NotEmpty();
        RuleFor(x => x.ProductionAreaId).NotEmpty();
        RuleFor(x => x.AreaInputValue).GreaterThan(0);
        RuleFor(x => x.AreaInputUnit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Label).MaximumLength(200);
    }
}
