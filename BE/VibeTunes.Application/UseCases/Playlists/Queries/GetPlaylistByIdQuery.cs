using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Playlists.Queries;

public sealed record GetPlaylistByIdQuery(Guid PlaylistId) : IRequest<PlaylistDto>;