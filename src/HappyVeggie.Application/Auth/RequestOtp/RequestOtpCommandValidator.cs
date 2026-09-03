using FluentValidation;

namespace HappyVeggie.Application.Auth.RequestOtp;

public sealed class RequestOtpCommandValidator : AbstractValidator<RequestOtpCommand>
{
    public RequestOtpCommandValidator()
    {
        RuleFor(x => x.Phone)
            .NotEmpty()
            .Matches(@"^\+\d{7,15}$")
            .WithMessage("Phone must be in E.164 format (e.g. +923001234567).");

        RuleFor(x => x.Language)
            .NotEmpty()
            .MaximumLength(5);
    }
}
