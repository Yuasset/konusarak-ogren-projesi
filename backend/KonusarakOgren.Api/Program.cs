using Microsoft.EntityFrameworkCore;


// BUILDER
var builder = WebApplication.CreateBuilder(args);

var dbHost = builder.Configuration["DB_HOST"];
var dbName = builder.Configuration["DB_NAME"];
var dbUser = builder.Configuration["DB_USER"];
var dbPass = builder.Configuration["DB_PASS"];
var connectionString = $"Host={dbHost};Database={dbName};Username={dbUser};Password={dbPass};SSL Mode=Require;";

builder.Services.AddDbContext<MessageContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddHttpClient("HuggingFace", client =>
{
    client.BaseAddress = new Uri("https://yuasset-benim-duygu-analizim.hf.space/analyze");
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");


// APP
var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// ENDPOINTS
app.MapGet("/api/messages", async (MessageContext db) =>
{
    return await db.Messages.OrderBy(m => m.Timestamp).ToListAsync();
});

app.MapPost("/api/messages", async (MessageInput input, MessageContext db, IHttpClientFactory httpClientFactory, ILogger<Program> logger) =>
{
    var aiClient = httpClientFactory.CreateClient("HuggingFace");

    var aiRequest = new { data = new[] { input.Text } };
    var aiResponse = await aiClient.PostAsJsonAsync("", aiRequest);

    string sentimentLabel = "neutral";
    double sentimentScore = 0.5;

    if (aiResponse.IsSuccessStatusCode)
    {
        var rawJson = await aiResponse.Content.ReadAsStringAsync();

        if (rawJson.Contains("\"data\""))
        {
            var aiResult = System.Text.Json.JsonSerializer.Deserialize<HuggingFaceResponse>(rawJson);

            if (aiResult != null && aiResult.data.Length > 0)
            {
                sentimentLabel = aiResult.data[0].label;
                sentimentScore = aiResult.data[0].score;
            }
        }
        else
        {
            logger.LogWarning($"AI servisi 200 OK döndü ama 'data' yok. Gelen JSON: {rawJson}");
        }
    }
    else
    {
        var errorContent = await aiResponse.Content.ReadAsStringAsync();
        logger.LogWarning($"AI servisine ulaşılamadı. Status: {aiResponse.StatusCode}, Hata: {errorContent}");
    }

    // DATABASE
    var newMessage = new Message
    {
        Username = input.Username,
        Text = input.Text,
        SentimentLabel = sentimentLabel,
        SentimentScore = sentimentScore
    };

    db.Messages.Add(newMessage);
    await db.SaveChangesAsync();

    return Results.Ok(newMessage);
});

// MIGRATIONS
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MessageContext>();
    db.Database.Migrate();
}

app.Run();

// DATA MODELS
public record MessageInput(string Username, string Text);
public record HuggingFaceResponse(HuggingFaceResult[] data);
public record HuggingFaceResult(string label, double score);