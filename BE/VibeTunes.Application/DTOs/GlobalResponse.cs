namespace VibeTunes.Application.DTOs;

public class GlobalResponse<T>
{
    public T? Data { get; set; }
    public string Message { get; set; }
    public int StatusCode { get; set; }
    public bool IsSuccess => StatusCode >= 200 && StatusCode < 300;
    
    public GlobalResponse(T? data, string message, int statusCode)
    {
        Data = data;
        Message = message;
        StatusCode = statusCode;
    }
    
    public GlobalResponse(string message, int statusCode)
    {
        Message = message;
        StatusCode = statusCode;
    }

    public static GlobalResponse<T?> Success(T? data, string message = "Request successful", int statusCode = 200)
        => new(data, message, statusCode);

    public static GlobalResponse<T> Error(string message, int statusCode = 400)
        => new(message, statusCode);
}