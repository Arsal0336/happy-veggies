using FluentValidation;

namespace HappyVeggie.Application.Farms.UpdateFarm;

public sealed class UpdateFarmCommandValidator : AbstractValidator<UpdateFarmCommand>
{
    public UpdateFarmCommandValidator()
    {
        RuleFor(x => x.FarmId).NotEmpty();
        RuleFor(x => x.Lat).InclusiveBetween(-90, 90).When(x => x.Lat.HasValue);
        RuleFor(x => x.Lng).InclusiveBetween(-180, 180).When(x => x.Lng.HasValue);
        RuleFor(x => x.AreaInputValue).GreaterThan(0).When(x => x.AreaInputValue.HasValue);
        RuleFor(x => x.Name).MaximumLength(200).When(x => x.Name is not null);
    }
}
