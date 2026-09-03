using FluentValidation;

namespace HappyVeggie.Application.Auth.VerifyOtp;

public sealed class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
{
    public VerifyOtpCommandValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();

        RuleFor(x => x.Phone)
            .NotEmpty()
            .Matches(@"^\+\d{7,15}$")
            .WithMessage("Phone must be in E.164 format.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .Length(4, 8);
    }
}
