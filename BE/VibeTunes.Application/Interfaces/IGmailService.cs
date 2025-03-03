namespace VibeTunes.Application.Interfaces;

public interface IGmailService
{
    public Task SendEmailAsync(string toEmail, string subject, string body);
}