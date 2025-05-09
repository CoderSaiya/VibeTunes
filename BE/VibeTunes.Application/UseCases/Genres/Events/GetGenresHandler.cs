using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Genres.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Genres.Events;

public class GetGenresHandler(
    IGenreRepository genreRepository
    ) : IRequestHandler<GetGenresQuery, IEnumerable<GenreDto>>
{
    public async Task<IEnumerable<GenreDto>> Handle(GetGenresQuery request, CancellationToken cancellationToken)
    {
        var genres = await genreRepository.GetAllGenresAsync();
        
        return genres.Select(g => new GenreDto(g.Id, g.GenreName));
    }
}