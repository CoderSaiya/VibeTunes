using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Statistics.Queries;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Statistics.Events;

public class GetUserArtistStatisticsHandler(
    IUserRepository userRepository
) : IRequestHandler<GetUserArtistStatisticsQuery, IEnumerable<DateCountDto>>
{
    public async Task<IEnumerable<DateCountDto>> Handle(GetUserArtistStatisticsQuery request, CancellationToken cancellationToken)
    { 
        var result = await userRepository.GetUserAndArtistCountsByMonthAsync(request.Month, request.Year);
        
        return result.Select(r => new DateCountDto(
            r.Name,
            r.TotalUsers,
            r.TotalArtists
            ));
    }
}