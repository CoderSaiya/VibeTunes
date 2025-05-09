using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Domain.Specifications;

namespace VibeTunes.Application.UseCases.Playlists.Queries;

public sealed record GetPlaylistsQuery(PlaylistFilter? Filter) : IRequest<IEnumerable<PlaylistDto>>;