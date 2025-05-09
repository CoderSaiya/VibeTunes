using MediatR;
using VibeTunes.Application.DTOs;
using VibeTunes.Application.UseCases.Statistics.Queries;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Entities;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Statistics.Events;

public class GetStatisticsHandler(IStatisticsRepository statisticsRepository) : IRequestHandler<GetStatisticsQuery, StatisticsDto>
{
    public async Task<StatisticsDto> Handle(GetStatisticsQuery request, CancellationToken cancellationToken)
    {
        // Tính khoảng thời gian
        var now = DateTime.UtcNow;
        var startOfCurrentMonth = new DateTime(now.Year, now.Month, 1);
        var startOfPreviousMonth = startOfCurrentMonth.AddMonths(-1);
        var startOfNextMonth = startOfCurrentMonth.AddMonths(1);

        // Users
        var totalUsers = await statisticsRepository.GetTotalCountAsync<User>(cancellationToken);
        var usersPrev = await statisticsRepository.GetCountByDateRangeAsync<User>(startOfPreviousMonth, startOfCurrentMonth, cancellationToken);
        var usersCurr = await statisticsRepository.GetCountByDateRangeAsync<User>(startOfCurrentMonth, startOfNextMonth, cancellationToken);

        // Artists
        var totalArtists = await statisticsRepository.GetTotalCountAsync<Artist>(cancellationToken);
        var artistsPrev = await statisticsRepository.GetCountByDateRangeAsync<Artist>(startOfPreviousMonth, startOfCurrentMonth, cancellationToken);
        var artistsCurr = await statisticsRepository.GetCountByDateRangeAsync<Artist>(startOfCurrentMonth, startOfNextMonth, cancellationToken);

        // Songs
        var totalSongs = await statisticsRepository.GetTotalCountAsync<Song>(cancellationToken);
        var songsPrev = await statisticsRepository.GetCountByDateRangeAsync<Song>(startOfPreviousMonth, startOfCurrentMonth, cancellationToken);
        var songsCurr = await statisticsRepository.GetCountByDateRangeAsync<Song>(startOfCurrentMonth, startOfNextMonth, cancellationToken);

        // Playlists
        var totalPlaylists = await statisticsRepository.GetTotalCountAsync<Playlist>(cancellationToken);
        var playlistsPrev = await statisticsRepository.GetCountByDateRangeAsync<Playlist>(startOfPreviousMonth, startOfCurrentMonth, cancellationToken);
        var playlistsCurr = await statisticsRepository.GetCountByDateRangeAsync<Playlist>(startOfCurrentMonth, startOfNextMonth, cancellationToken);


        return new StatisticsDto
        {
            Users = new EntityStatistics {
                EntityName = "Users",
                TotalCount = totalUsers,
                PreviousMonthCount = usersPrev,
                CurrentMonthCount = usersCurr
            },
            Artists = new EntityStatistics {
                EntityName = "Artists",
                TotalCount = totalArtists,
                PreviousMonthCount = artistsPrev,
                CurrentMonthCount = artistsCurr
            },
            Songs = new EntityStatistics {
                EntityName = "Songs",
                TotalCount = totalSongs,
                PreviousMonthCount = songsPrev,
                CurrentMonthCount = songsCurr
            },
            Playlists = new EntityStatistics {
                EntityName = "Playlists",
                TotalCount = totalPlaylists,
                PreviousMonthCount = playlistsPrev,
                CurrentMonthCount = playlistsCurr
            }
        };
    }
}