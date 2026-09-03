using MediatR;

namespace HappyVeggie.Application.Farmers.UpdateProfile;

public sealed record UpdateFarmerProfileCommand(Guid FarmerId, string Name, string Language) : IRequest<UpdateFarmerProfileResponse>;

public sealed record UpdateFarmerProfileResponse(Guid Id, string Phone, string Name, string Language);
