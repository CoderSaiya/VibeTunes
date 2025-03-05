using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Authentication.Queries;

public record GetProfileQuery(Guid UserId) : IRequest<ProfileDto>;