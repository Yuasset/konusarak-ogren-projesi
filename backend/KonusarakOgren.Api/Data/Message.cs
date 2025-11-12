public class Message
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? Text { get; set; }
    public string? SentimentLabel { get; set; }
    public double SentimentScore { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}