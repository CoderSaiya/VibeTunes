using MediatR;

namespace VibeTunes.Application.UseCases.Histories.Commands;

public sealed record ExportUserHistoryCommand() : IRequest<string>;