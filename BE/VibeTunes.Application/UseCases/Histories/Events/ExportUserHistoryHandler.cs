using System.Text;
using MediatR;
using VibeTunes.Application.Interfaces;
using VibeTunes.Application.UseCases.Histories.Commands;
using VibeTunes.Domain.Common;
using VibeTunes.Domain.Interfaces;

namespace VibeTunes.Application.UseCases.Histories.Events;

public class ExportUserHistoryHandler(
    IHistoryRepository historyRepository,
    IFileService fileService
    ) : IRequestHandler<ExportUserHistoryCommand, string>
{
    public async Task<string> Handle(ExportUserHistoryCommand request, CancellationToken cancellationToken)
    {
        // get histories list
        var histories = await historyRepository.GetAllHistoriesAsync();
        
        // export and storage csv file (string builder)
        var sb = new StringBuilder();
        
        sb.AppendLine("UserId, SongId, ListenDuration");

        foreach (var history in histories)
            sb.AppendLine($"{GuidConverter.ToFloat(history.UserId)}," + 
                          $"{GuidConverter.ToFloat(history.SongId)}," + 
                          $"{history.ListenDuration}");

        var csvBytes = Encoding.UTF8.GetBytes(sb.ToString());
        
        var fileName = $"song-rating.csv";
        
        var filePath = await fileService.SaveFileAsync(csvBytes, fileName, null!, cancellationToken);
        
        return filePath;
    }
}