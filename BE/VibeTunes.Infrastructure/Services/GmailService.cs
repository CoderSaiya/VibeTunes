using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;
using VibeTunes.Application.Interfaces;

namespace VibeTunes.Infrastructure.Services;

public class GmailService(IConfiguration configuration) : IGmailService
{
    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress("VibeTunes", toEmail));
        email.To.Add(MailboxAddress.Parse(toEmail));
        email.Subject = subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

        var smtp = new SmtpClient();
        await smtp.ConnectAsync(configuration["SMTP:Host"], int.Parse(configuration["SMTP:PORT"] ?? "465"), MailKit.Security.SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(configuration["SMTP:Username"], configuration["SMTP:Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}