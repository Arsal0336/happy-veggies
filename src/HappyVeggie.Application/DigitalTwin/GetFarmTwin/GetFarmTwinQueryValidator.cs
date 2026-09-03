using FluentValidation;

namespace HappyVeggie.Application.DigitalTwin.GetFarmTwin;

public sealed class GetFarmTwinQueryValidator : AbstractValidator<GetFarmTwinQuery>
{
    public GetFarmTwinQueryValidator()
    {
        RuleFor(x => x.FarmId).NotEmpty();
    }
}
