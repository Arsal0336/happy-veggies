using FluentValidation;

namespace HappyVeggie.Application.ProductionAreas.CreateProductionArea;

public sealed class CreateProductionAreaCommandValidator : AbstractValidator<CreateProductionAreaCommand>
{
    public CreateProductionAreaCommandValidator()
    {
        RuleFor(x => x.FarmId).NotEmpty();
        RuleFor(x => x.TypeCode).NotEmpty().MaximumLength(50);
        RuleFor(x => x.AreaInputValue).GreaterThan(0);
        RuleFor(x => x.AreaInputUnit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Name).MaximumLength(200);
    }
}
