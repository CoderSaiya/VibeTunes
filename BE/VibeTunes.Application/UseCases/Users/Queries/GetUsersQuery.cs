using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Users.Queries;

public sealed record GetUsersQuery(UserFilter? Filter, bool IsArtist = true) : IRequest<IEnumerable<UserDto>>;