namespace HappyVeggie.Api.Contracts;

public sealed record ApiErrorResponse(
    string Code,
    string Message,
    string CorrelationId,
    IReadOnlyCollection<ApiValidationError> Errors,
    bool Retryable);

public sealed record ApiValidationError(string Field, string Message);
