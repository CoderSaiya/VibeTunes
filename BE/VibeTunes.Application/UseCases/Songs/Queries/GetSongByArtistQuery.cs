using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Songs.Queries;

public record GetSongByArtistQuery(Guid ArtistId) : IRequest<IEnumerable<SongDto>>;