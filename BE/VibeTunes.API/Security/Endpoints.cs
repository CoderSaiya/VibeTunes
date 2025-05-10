namespace BE.Security;

public static class Endpoints
{
    // Public (no authentication required)
    public static readonly string[] Public = new[]
    {
        "/auth/sign-up",
        "/auth/sign-in",
        "/auth/refresh-token",
        "/auth/forgot-password",
        "/auth/verify-code",
        "/auth/reset-password",
        "/auth/google",
        "/song",
        "/song/artist",
        "/room",
        "/genre"
    };
    
    public static readonly string[] User = new[]
    {
        "/playlist",
        "/playlist/{id}",
        "/playlist/user/{userId}",
        "/playlist/{playlistId}/songs",
        "/playlist",
        "/song/stream",
        "/song/log",
        "/songs",
        "/subscriptions",
        "/user/profile",
        "/user/profile",
        "/user/follow"
    };

    // Artist (users with Artist role)
    public static readonly string[] Artist = new[]
    {
        "/album",
        "/album/artist",
        "/album",
        "/song",
        "/playlist",
        "/recommend/train"
    };

    // Admin (administrator and moderator)
    public static readonly string[] Admin = new[]
    {
        "/album",
        "/genre",
        "/history/export",
        "/payment/create-payment-intent",
        "/payment/webhook/{provider}",
        "/payment/transaction/{transactionId}/status",
        "/statistics",
        "/statistics/top-artists",
        "/statistics/user-top-artists",
        "/recommend/train"
    };
}
