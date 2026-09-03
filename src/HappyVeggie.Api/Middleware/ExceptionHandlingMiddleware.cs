using FluentValidation;
using HappyVeggie.Api.Contracts;
using HappyVeggie.Application.Common.Exceptions;

namespace HappyVeggie.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (ValidationException validationException)
        {
            _logger.LogWarning(validationException, "Validation failed for request {Path}", httpContext.Request.Path);
            await WriteValidationErrorAsync(httpContext, validationException);
        }
        catch (UnauthorizedAccessException unauthorizedException)
        {
            _logger.LogWarning(unauthorizedException, "Unauthorized access for request {Path}", httpContext.Request.Path);
            await WriteErrorAsync(httpContext, StatusCodes.Status401Unauthorized, "UNAUTHORIZED", unauthorizedException.Message);
        }
        catch (ForbiddenAccessException forbiddenException)
        {
            _logger.LogWarning(forbiddenException, "Forbidden access for request {Path}", httpContext.Request.Path);
            await WriteErrorAsync(httpContext, StatusCodes.Status403Forbidden, "FORBIDDEN", forbiddenException.Message);
        }
        catch (KeyNotFoundException notFoundException)
        {
            _logger.LogWarning(notFoundException, "Resource not found for request {Path}", httpContext.Request.Path);
            await WriteErrorAsync(httpContext, StatusCodes.Status404NotFound, "NOT_FOUND", notFoundException.Message);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled exception for request {Path}", httpContext.Request.Path);
            await WriteServerErrorAsync(httpContext);
        }
    }

    private static Task WriteValidationErrorAsync(HttpContext context, ValidationException exception)
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        context.Response.ContentType = "application/json";

        var errors = exception.Errors
            .Select(error => new ApiValidationError(error.PropertyName, error.ErrorMessage))
            .ToArray();

        var response = new ApiErrorResponse(
            "VALIDATION_ERROR",
            "Validation failed.",
            context.TraceIdentifier,
            errors,
            false);

        return context.Response.WriteAsJsonAsync(response);
    }

    private static Task WriteErrorAsync(HttpContext context, int statusCode, string code, string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse(
            code,
            message,
            context.TraceIdentifier,
            Array.Empty<ApiValidationError>(),
            false);

        return context.Response.WriteAsJsonAsync(response);
    }

    private static Task WriteServerErrorAsync(HttpContext context)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse(
            "INTERNAL_SERVER_ERROR",
            "An unexpected server error occurred.",
            context.TraceIdentifier,
            Array.Empty<ApiValidationError>(),
            false);

        return context.Response.WriteAsJsonAsync(response);
    }
}
