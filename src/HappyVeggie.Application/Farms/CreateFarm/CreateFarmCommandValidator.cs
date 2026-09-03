using FluentValidation;

namespace HappyVeggie.Application.Farms.CreateFarm;

public sealed class CreateFarmCommandValidator : AbstractValidator<CreateFarmCommand>
{
    public CreateFarmCommandValidator()
    {
        RuleFor(x => x.FarmerId).NotEmpty();
        RuleFor(x => x.Lat).InclusiveBetween(-90, 90);
        RuleFor(x => x.Lng).InclusiveBetween(-180, 180);
        RuleFor(x => x.RegionCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.RegionLabel).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AreaInputValue).GreaterThan(0);
        RuleFor(x => x.AreaInputUnit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Name).MaximumLength(200);
    }
}
