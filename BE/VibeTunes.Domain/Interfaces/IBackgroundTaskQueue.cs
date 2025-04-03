namespace VibeTunes.Domain.Interfaces;

public interface IBackgroundTaskQueue
{
    public void Enqueue(Func<CancellationToken, Task> workItem);
    public Task<Func<CancellationToken, Task>> DequeueAsync(CancellationToken cancellationToken);
}