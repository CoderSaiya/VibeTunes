using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Users.Queries;

public record GetProfileQuery(Guid UserId) : IRequest<ProfileDto>;