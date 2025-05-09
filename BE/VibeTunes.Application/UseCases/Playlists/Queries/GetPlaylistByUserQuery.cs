using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Playlists.Queries;

public sealed record GetPlaylistByUserQuery(Guid UserId) : IRequest<IEnumerable<PlaylistDto>>;