using MediatR;
using VibeTunes.Application.Exceptions;
using VibeTunes.Application.UseCases.Genres.Commands;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Genres.Events;

public class AddGenreHandler(
    IGenreRepository genreRepository,
    IUnitOfWork unitOfWork
    ) : IRequestHandler<AddGenreCommand, Guid>
{
    public async Task<Guid> Handle(AddGenreCommand request, CancellationToken cancellationToken)
    {
        // check empty name
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new BusinessException("Name is required");
        
        // check name exist
        if (await genreRepository.GetGenreByNameAsync(request.Name) is not null)
            throw new BusinessException("Genre is already used");
        
        // add genre
        var newGenre = new Genre
        {
            GenreName = request.Name,
            GenreDescription = !string.IsNullOrWhiteSpace(request.Description) ? request.Description : null
        };
        
        await genreRepository.CreateGenreAsync(newGenre);
        
        // commit
        await unitOfWork.CommitAsync();
        
        return newGenre.Id;
    }
}