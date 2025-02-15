namespace VibeTunes.Domain.Interfaces;

public interface IUnitOfWork
{
    Task CommitAsync();
}