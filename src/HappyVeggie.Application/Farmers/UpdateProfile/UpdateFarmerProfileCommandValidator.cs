using FluentValidation;

namespace HappyVeggie.Application.Farmers.UpdateProfile;

public sealed class UpdateFarmerProfileCommandValidator : AbstractValidator<UpdateFarmerProfileCommand>
{
    public UpdateFarmerProfileCommandValidator()
    {
        RuleFor(x => x.FarmerId).NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Language)
            .NotEmpty()
            .MaximumLength(5);
    }
}
