using MediatR;
using VibeTunes.Application.DTOs;

namespace VibeTunes.Application.UseCases.Albums.Queries;

public sealed record GetAlbumsByArtistQuery(Guid ArtistId) : IRequest<IEnumerable<AlbumDto>>;